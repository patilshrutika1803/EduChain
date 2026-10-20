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

grant select, insert on public.profiles to authenticated;
grant update (display_name, updated_at) on public.profiles to authenticated;

grant select, insert, update on public.institutions to authenticated;
grant select, insert, update, delete on public.institution_memberships to authenticated;
grant select on public.credentials to authenticated;
grant update (status, blockchain_transaction_hash, contract_address, updated_at)
    on public.credentials to authenticated;
grant select on public.audit_logs to authenticated;

drop policy if exists credentials_insert_verified_institution_issuer
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

commit;
