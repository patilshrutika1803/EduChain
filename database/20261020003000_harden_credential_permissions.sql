begin;

revoke all on schema educhain_private from public, anon, authenticated;
grant usage on schema educhain_private to authenticated;

revoke all on table
    public.profiles,
    public.institutions,
    public.institution_memberships,
    public.credentials,
    public.audit_logs
from public, anon, authenticated;

revoke select (id, display_name, role, created_at, updated_at),
    insert (id, display_name, role, created_at, updated_at),
    update (id, display_name, role, created_at, updated_at),
    references (id, display_name, role, created_at, updated_at)
    on table public.profiles from public, anon, authenticated;
revoke select (
    id, institution_name, verification_status, public_issuer_wallet_address,
    created_at, updated_at
), insert (
    id, institution_name, verification_status, public_issuer_wallet_address,
    created_at, updated_at
), update (
    id, institution_name, verification_status, public_issuer_wallet_address,
    created_at, updated_at
), references (
    id, institution_name, verification_status, public_issuer_wallet_address,
    created_at, updated_at
) on table public.institutions from public, anon, authenticated;
revoke select (
    institution_id, profile_id, membership_role, membership_status,
    created_at, updated_at
), insert (
    institution_id, profile_id, membership_role, membership_status,
    created_at, updated_at
), update (
    institution_id, profile_id, membership_role, membership_status,
    created_at, updated_at
), references (
    institution_id, profile_id, membership_role, membership_status,
    created_at, updated_at
) on table public.institution_memberships from public, anon, authenticated;
revoke select (
    id, credential_identifier, student_profile_id, issuing_institution_id,
    qualification_name, graduation_date, issue_date, status, commitment_hash,
    blockchain_transaction_hash, contract_address, created_at, updated_at
), insert (
    id, credential_identifier, student_profile_id, issuing_institution_id,
    qualification_name, graduation_date, issue_date, status, commitment_hash,
    blockchain_transaction_hash, contract_address, created_at, updated_at
), update (
    id, credential_identifier, student_profile_id, issuing_institution_id,
    qualification_name, graduation_date, issue_date, status, commitment_hash,
    blockchain_transaction_hash, contract_address, created_at, updated_at
), references (
    id, credential_identifier, student_profile_id, issuing_institution_id,
    qualification_name, graduation_date, issue_date, status, commitment_hash,
    blockchain_transaction_hash, contract_address, created_at, updated_at
) on table public.credentials from public, anon, authenticated;
revoke select (
    id, actor_profile_id, action_type, credential_id, occurred_at, metadata
), insert (
    id, actor_profile_id, action_type, credential_id, occurred_at, metadata
), update (
    id, actor_profile_id, action_type, credential_id, occurred_at, metadata
), references (
    id, actor_profile_id, action_type, credential_id, occurred_at, metadata
) on table public.audit_logs from public, anon, authenticated;

grant select on public.profiles to authenticated;
grant insert (id, display_name, role) on public.profiles to authenticated;
grant update (display_name, updated_at) on public.profiles to authenticated;

grant select on public.institutions to authenticated;
grant insert (institution_name, verification_status, public_issuer_wallet_address)
    on public.institutions to authenticated;
grant update (institution_name, verification_status, public_issuer_wallet_address)
    on public.institutions to authenticated;
grant select on public.institution_memberships to authenticated;
grant insert (institution_id, profile_id, membership_role, membership_status)
    on public.institution_memberships to authenticated;
grant update (membership_role, membership_status)
    on public.institution_memberships to authenticated;
grant delete on public.institution_memberships to authenticated;
grant select on public.credentials to authenticated;
revoke all on table public.credentials from service_role;
revoke select (
    id, credential_identifier, student_profile_id, issuing_institution_id,
    qualification_name, graduation_date, issue_date, status, commitment_hash,
    blockchain_transaction_hash, contract_address, created_at, updated_at
), insert (
    id, credential_identifier, student_profile_id, issuing_institution_id,
    qualification_name, graduation_date, issue_date, status, commitment_hash,
    blockchain_transaction_hash, contract_address, created_at, updated_at
), update (
    id, credential_identifier, student_profile_id, issuing_institution_id,
    qualification_name, graduation_date, issue_date, status, commitment_hash,
    blockchain_transaction_hash, contract_address, created_at, updated_at
), references (
    id, credential_identifier, student_profile_id, issuing_institution_id,
    qualification_name, graduation_date, issue_date, status, commitment_hash,
    blockchain_transaction_hash, contract_address, created_at, updated_at
) on table public.credentials from service_role;

-- Issuance needs INSERT plus SELECT of the fields returned by the trusted API.
-- Do not replace these column grants with broad table-level write privileges.
grant select (
    id, credential_identifier, student_profile_id, issuing_institution_id,
    qualification_name, graduation_date, issue_date, status, commitment_hash,
    blockchain_transaction_hash, contract_address, created_at
) on table public.credentials to service_role;
grant insert (
    credential_identifier, student_profile_id, issuing_institution_id,
    qualification_name, graduation_date, status, commitment_hash
) on public.credentials to service_role;
grant select on public.audit_logs to authenticated;

drop policy if exists credentials_insert_verified_institution_issuer
    on public.credentials;
drop policy if exists credentials_update_verified_institution_issuer
    on public.credentials;

create or replace function public.set_profile_role(
    p_profile_id uuid,
    p_role text
)
returns void
language plpgsql
security definer
set search_path = pg_catalog, public
set row_security = off
as $function$
begin
    if p_role is null
       or p_role not in ('student', 'institution_admin', 'platform_admin') then
        raise exception 'Invalid profile role'
            using errcode = '22023';
    end if;

    if not educhain_private.is_platform_admin() then
        raise exception 'Only a platform administrator may change a profile role'
            using errcode = '42501';
    end if;

    update public.profiles
    set role = p_role
    where id = p_profile_id;

    if not found then
        raise exception 'Profile not found'
            using errcode = 'P0002';
    end if;
end;
$function$;

revoke all on function educhain_private.is_platform_admin()
    from public, anon, authenticated;
revoke all on function educhain_private.has_institution_membership(uuid, text[], boolean)
    from public, anon, authenticated;
grant execute on function educhain_private.is_platform_admin()
    to authenticated;
grant execute on function educhain_private.has_institution_membership(uuid, text[], boolean)
    to authenticated;

revoke all on function educhain_private.set_updated_at()
    from public, anon, authenticated;
revoke all on function educhain_private.initialize_timestamps()
    from public, anon, authenticated;
revoke all on function educhain_private.guard_profile_update()
    from public, anon, authenticated;
revoke all on function educhain_private.guard_membership_update()
    from public, anon, authenticated;
revoke all on function educhain_private.guard_credential_update()
    from public, anon, authenticated;
revoke all on function educhain_private.log_credential_change()
    from public, anon, authenticated;

revoke all on function public.set_profile_role(uuid, text)
    from public, anon, authenticated;
grant execute on function public.set_profile_role(uuid, text)
    to authenticated;

do $block$
begin
    if not has_table_privilege(
        'authenticated', 'public.credentials', 'SELECT'
    ) then
        raise exception 'Authenticated credential SELECT privilege is missing';
    end if;

    if exists (
        select 1
        from pg_catalog.pg_attribute a
        where a.attrelid = 'public.credentials'::regclass
          and a.attnum > 0
          and not a.attisdropped
          and (
              has_column_privilege('authenticated', a.attrelid, a.attname, 'INSERT')
              or has_column_privilege('authenticated', a.attrelid, a.attname, 'UPDATE')
              or has_column_privilege('authenticated', a.attrelid, a.attname, 'REFERENCES')
          )
    ) then
        raise exception 'Authenticated users retain credential INSERT, UPDATE, or REFERENCES privileges';
    end if;

    if has_table_privilege('authenticated', 'public.credentials', 'DELETE')
       or has_table_privilege('authenticated', 'public.credentials', 'TRUNCATE') then
        raise exception 'Authenticated users retain credential DELETE or TRUNCATE privileges';
    end if;

    if has_table_privilege('service_role', 'public.credentials', 'SELECT')
       or has_table_privilege('service_role', 'public.credentials', 'INSERT')
       or has_table_privilege('service_role', 'public.credentials', 'UPDATE')
       or has_table_privilege('service_role', 'public.credentials', 'DELETE')
       or has_table_privilege('service_role', 'public.credentials', 'TRUNCATE')
       or has_table_privilege('service_role', 'public.credentials', 'REFERENCES')
       or has_table_privilege('service_role', 'public.credentials', 'TRIGGER') then
        raise exception 'Service role retains broad table-level credential privileges';
    end if;

    if exists (
        select 1
        from pg_catalog.pg_attribute a
        where a.attrelid = 'public.credentials'::regclass
          and a.attnum > 0
          and not a.attisdropped
          and (
              has_column_privilege('service_role', a.attrelid, a.attname, 'REFERENCES')
              or has_column_privilege('service_role', a.attrelid, a.attname, 'UPDATE')
              or (
                  has_column_privilege('service_role', a.attrelid, a.attname, 'INSERT')
                  and a.attname not in (
                      'credential_identifier', 'student_profile_id',
                      'issuing_institution_id', 'qualification_name',
                      'graduation_date', 'status', 'commitment_hash'
                  )
              )
              or (
                  has_column_privilege('service_role', a.attrelid, a.attname, 'SELECT')
                  and a.attname not in (
                      'id', 'credential_identifier', 'student_profile_id',
                      'issuing_institution_id', 'qualification_name',
                      'graduation_date', 'issue_date', 'status',
                      'commitment_hash', 'blockchain_transaction_hash',
                      'contract_address', 'created_at'
                  )
              )
          )
    ) then
        raise exception 'Service-role credential column privileges exceed the issuance scope';
    end if;

    if exists (
        select 1
        from unnest(array[
            'credential_identifier', 'student_profile_id',
            'issuing_institution_id', 'qualification_name',
            'graduation_date', 'status', 'commitment_hash'
        ]) as required(column_name)
        where not has_column_privilege(
            'service_role', 'public.credentials', required.column_name, 'INSERT'
        )
    ) or exists (
        select 1
        from unnest(array[
            'id', 'credential_identifier', 'student_profile_id',
            'issuing_institution_id', 'qualification_name',
            'graduation_date', 'issue_date', 'status', 'commitment_hash',
            'blockchain_transaction_hash', 'contract_address', 'created_at'
        ]) as required(column_name)
        where not has_column_privilege(
            'service_role', 'public.credentials', required.column_name, 'SELECT'
        )
    ) then
        raise exception 'Required service-role credential issuance privileges are missing';
    end if;
end;
$block$;

commit;
