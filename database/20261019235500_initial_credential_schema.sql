begin;

create schema if not exists educhain_private;
revoke all on schema educhain_private from public, anon;
grant usage on schema educhain_private to authenticated;

create table public.profiles (
    id uuid primary key references auth.users (id) on delete cascade,
    display_name text not null,
    role text not null default 'student'
        check (role in ('student', 'institution_admin', 'platform_admin')),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint profiles_display_name_not_blank check (length(trim(display_name)) > 0)
);

create table public.institutions (
    id uuid primary key default gen_random_uuid(),
    institution_name text not null,
    verification_status text not null default 'pending'
        check (verification_status in ('pending', 'verified', 'rejected', 'suspended')),
    public_issuer_wallet_address text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint institutions_name_not_blank check (length(trim(institution_name)) > 0)
);

create table public.institution_memberships (
    institution_id uuid not null references public.institutions (id) on delete cascade,
    profile_id uuid not null references public.profiles (id) on delete cascade,
    membership_role text not null
        check (membership_role in ('institution_admin', 'issuer', 'viewer')),
    membership_status text not null default 'pending'
        check (membership_status in ('pending', 'active', 'suspended')),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    primary key (institution_id, profile_id)
);

create table public.credentials (
    id uuid primary key default gen_random_uuid(),
    credential_identifier text not null unique,
    student_profile_id uuid not null references public.profiles (id) on delete restrict,
    issuing_institution_id uuid not null references public.institutions (id) on delete restrict,
    qualification_name text not null,
    graduation_date date not null,
    issue_date date not null default current_date,
    status text not null default 'active'
        check (status in ('active', 'suspended', 'revoked')),
    commitment_hash bytea not null
        check (octet_length(commitment_hash) = 32),
    blockchain_transaction_hash text,
    contract_address text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint credentials_identifier_not_blank check (length(trim(credential_identifier)) > 0),
    constraint credentials_qualification_not_blank check (length(trim(qualification_name)) > 0)
);

create table public.audit_logs (
    id uuid primary key default gen_random_uuid(),
    actor_profile_id uuid references public.profiles (id) on delete set null,
    action_type text not null
        check (action_type in ('credential_issued', 'credential_updated', 'credential_status_changed')),
    credential_id uuid references public.credentials (id) on delete set null,
    occurred_at timestamptz not null default now(),
    metadata jsonb not null default '{}'::jsonb
        check (jsonb_typeof(metadata) = 'object')
);

create index institution_memberships_profile_id_idx
    on public.institution_memberships (profile_id);
create index credentials_student_profile_id_idx
    on public.credentials (student_profile_id);
create index credentials_issuing_institution_id_idx
    on public.credentials (issuing_institution_id);

create function educhain_private.is_platform_admin()
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public
set row_security = off
as $function$
    select exists (
        select 1
        from public.profiles p
        where p.id = (select auth.uid())
          and p.role = 'platform_admin'
    );
$function$;

create function educhain_private.has_institution_membership(
    p_institution_id uuid,
    p_roles text[] default null,
    p_require_verified boolean default false
)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public
set row_security = off
as $function$
    select exists (
        select 1
        from public.institution_memberships m
        join public.institutions i on i.id = m.institution_id
        where m.institution_id = p_institution_id
          and m.profile_id = (select auth.uid())
          and m.membership_status = 'active'
          and (p_roles is null or m.membership_role = any (p_roles))
          and (not p_require_verified or i.verification_status = 'verified')
    );
$function$;

revoke all on function educhain_private.is_platform_admin() from public;
revoke all on function educhain_private.has_institution_membership(uuid, text[], boolean) from public;
grant execute on function educhain_private.is_platform_admin() to authenticated;
grant execute on function educhain_private.has_institution_membership(uuid, text[], boolean) to authenticated;

create function educhain_private.set_updated_at()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $function$
begin
    if new.created_at is distinct from old.created_at then
        raise exception 'A creation timestamp cannot be changed'
            using errcode = '42501';
    end if;

    new.updated_at := now();
    return new;
end;
$function$;

create function educhain_private.initialize_timestamps()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $function$
begin
    new.created_at := now();
    new.updated_at := now();
    return new;
end;
$function$;

create function educhain_private.guard_profile_update()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $function$
begin
    if new.id is distinct from old.id then
        raise exception 'A profile ID cannot be changed'
            using errcode = '42501';
    end if;

    if new.role is distinct from old.role
       and not educhain_private.is_platform_admin() then
        raise exception 'Only a platform administrator may change a profile role'
            using errcode = '42501';
    end if;

    return new;
end;
$function$;

create function educhain_private.guard_membership_update()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $function$
begin
    if new.institution_id is distinct from old.institution_id
       or new.profile_id is distinct from old.profile_id
       or new.created_at is distinct from old.created_at then
        raise exception 'Membership identity and creation timestamp cannot be changed'
            using errcode = '42501';
    end if;

    new.updated_at := now();
    return new;
end;
$function$;

create function educhain_private.guard_credential_update()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $function$
begin
    if new.credential_identifier is distinct from old.credential_identifier
       or new.student_profile_id is distinct from old.student_profile_id
       or new.issuing_institution_id is distinct from old.issuing_institution_id
       or new.qualification_name is distinct from old.qualification_name
       or new.graduation_date is distinct from old.graduation_date
       or new.issue_date is distinct from old.issue_date
       or new.commitment_hash is distinct from old.commitment_hash then
        raise exception 'Issued credential details, ownership, issuer, and commitment are immutable'
            using errcode = '42501';
    end if;

    if new.status is distinct from old.status then
        if old.status = 'revoked'
           or (old.status = 'active' and new.status not in ('suspended', 'revoked'))
           or (old.status = 'suspended' and new.status not in ('active', 'revoked')) then
            raise exception 'Invalid credential status transition: % to %', old.status, new.status
                using errcode = '23514';
        end if;
    end if;

    new.updated_at := now();
    return new;
end;
$function$;

create function educhain_private.log_credential_change()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
set row_security = off
as $function$
declare
    v_action_type text;
    v_metadata jsonb;
begin
    if tg_op = 'INSERT' then
        v_action_type := 'credential_issued';
        v_metadata := jsonb_build_object('status', new.status);
    elsif new.status is distinct from old.status then
        v_action_type := 'credential_status_changed';
        v_metadata := jsonb_build_object(
            'previous_status', old.status,
            'new_status', new.status
        );
    else
        v_action_type := 'credential_updated';
        v_metadata := '{}'::jsonb;
    end if;

    insert into public.audit_logs (
        actor_profile_id,
        action_type,
        credential_id,
        metadata
    )
    values (
        (select auth.uid()),
        v_action_type,
        new.id,
        v_metadata
    );

    return new;
end;
$function$;

revoke all on function educhain_private.set_updated_at() from public;
revoke all on function educhain_private.initialize_timestamps() from public;
revoke all on function educhain_private.guard_profile_update() from public;
revoke all on function educhain_private.guard_membership_update() from public;
revoke all on function educhain_private.guard_credential_update() from public;
revoke all on function educhain_private.log_credential_change() from public;

create trigger profiles_guard_update
before update on public.profiles
for each row execute function educhain_private.guard_profile_update();
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function educhain_private.set_updated_at();
create trigger profiles_initialize_timestamps
before insert on public.profiles
for each row execute function educhain_private.initialize_timestamps();
create trigger institutions_set_updated_at
before update on public.institutions
for each row execute function educhain_private.set_updated_at();
create trigger institutions_initialize_timestamps
before insert on public.institutions
for each row execute function educhain_private.initialize_timestamps();
create trigger institution_memberships_initialize_timestamps
before insert on public.institution_memberships
for each row execute function educhain_private.initialize_timestamps();
create trigger institution_memberships_guard_update
before update on public.institution_memberships
for each row execute function educhain_private.guard_membership_update();
create trigger credentials_guard_update
before update on public.credentials
for each row execute function educhain_private.guard_credential_update();
create trigger credentials_log_insert
after insert on public.credentials
for each row execute function educhain_private.log_credential_change();
create trigger credentials_log_update
after update on public.credentials
for each row execute function educhain_private.log_credential_change();
create trigger credentials_set_updated_at
before update on public.credentials
for each row execute function educhain_private.set_updated_at();
create trigger credentials_initialize_timestamps
before insert on public.credentials
for each row execute function educhain_private.initialize_timestamps();

alter table public.profiles enable row level security;
alter table public.institutions enable row level security;
alter table public.institution_memberships enable row level security;
alter table public.credentials enable row level security;
alter table public.audit_logs enable row level security;

revoke all on table
    public.profiles,
    public.institutions,
    public.institution_memberships,
    public.credentials,
    public.audit_logs
from public, anon, authenticated;

grant select, insert, update on public.profiles to authenticated;
grant select, insert, update on public.institutions to authenticated;
grant select, insert, update, delete on public.institution_memberships to authenticated;
grant select, insert, update on public.credentials to authenticated;
grant select on public.audit_logs to authenticated;

create policy profiles_select_self_or_platform_admin
on public.profiles for select to authenticated
using (id = (select auth.uid()) or educhain_private.is_platform_admin());

create policy profiles_insert_self_as_student
on public.profiles for insert to authenticated
with check (id = (select auth.uid()) and role = 'student');

create policy profiles_insert_platform_admin
on public.profiles for insert to authenticated
with check (educhain_private.is_platform_admin());

create policy profiles_update_self
on public.profiles for update to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));

create policy profiles_update_platform_admin
on public.profiles for update to authenticated
using (educhain_private.is_platform_admin())
with check (educhain_private.is_platform_admin());

create policy institutions_select_members_or_platform_admin
on public.institutions for select to authenticated
using (
    educhain_private.is_platform_admin()
    or educhain_private.has_institution_membership(id)
);

create policy institutions_insert_platform_admin
on public.institutions for insert to authenticated
with check (educhain_private.is_platform_admin());

create policy institutions_update_platform_admin
on public.institutions for update to authenticated
using (educhain_private.is_platform_admin())
with check (educhain_private.is_platform_admin());

create policy institution_memberships_select_self_or_admin
on public.institution_memberships for select to authenticated
using (
    profile_id = (select auth.uid())
    or educhain_private.is_platform_admin()
    or educhain_private.has_institution_membership(
        institution_id,
        array['institution_admin']::text[],
        true
    )
);

create policy institution_memberships_insert_admin
on public.institution_memberships for insert to authenticated
with check (
    educhain_private.is_platform_admin()
    or educhain_private.has_institution_membership(
        institution_id,
        array['institution_admin']::text[],
        true
    )
);

create policy institution_memberships_update_admin
on public.institution_memberships for update to authenticated
using (
    educhain_private.is_platform_admin()
    or educhain_private.has_institution_membership(
        institution_id,
        array['institution_admin']::text[],
        true
    )
)
with check (
    educhain_private.is_platform_admin()
    or educhain_private.has_institution_membership(
        institution_id,
        array['institution_admin']::text[],
        true
    )
);

create policy institution_memberships_delete_admin
on public.institution_memberships for delete to authenticated
using (
    educhain_private.is_platform_admin()
    or educhain_private.has_institution_membership(
        institution_id,
        array['institution_admin']::text[],
        true
    )
);

create policy credentials_select_student_or_institution_member
on public.credentials for select to authenticated
using (
    student_profile_id = (select auth.uid())
    or educhain_private.is_platform_admin()
    or educhain_private.has_institution_membership(issuing_institution_id)
);

create policy credentials_insert_verified_institution_issuer
on public.credentials for insert to authenticated
with check (
    status = 'active'
    and educhain_private.has_institution_membership(
        issuing_institution_id,
        array['institution_admin', 'issuer']::text[],
        true
    )
);

create policy credentials_update_verified_institution_issuer
on public.credentials for update to authenticated
using (
    educhain_private.has_institution_membership(
        issuing_institution_id,
        array['institution_admin', 'issuer']::text[],
        true
    )
)
with check (
    educhain_private.has_institution_membership(
        issuing_institution_id,
        array['institution_admin', 'issuer']::text[],
        true
    )
);

create policy audit_logs_select_platform_admin
on public.audit_logs for select to authenticated
using (educhain_private.is_platform_admin());

commit;
