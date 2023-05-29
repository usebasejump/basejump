/****
  * Public Functions
  * Each of these functions exists in the public name space because they are accessible
  * via the API.  it is the primary way developers can interact with Basejump accounts
  * TODO: Add support for avatars to accounts/profiles.  Add getter/setter rpc functions for basejump.profiles
 */

/**
  * Returns the current user's account
 */
create or replace function public.get_profile(user_id uuid default null)
    returns jsonb
    language plpgsql
as
$$
declare
    response jsonb;
begin
    select jsonb_build_object(
                   'user_id', p.id,
                   'name', p.name,
                   'metadata', p.public_metadata,
                   'created_at', p.created_at,
                   'updated_at', p.updated_at
               )
    into response
    from basejump.profiles p
    where p.id = coalesce(get_profile.user_id, auth.uid());

    if response is null then
        raise exception 'Not found';
    end if;

    return response;
end;
$$;

grant execute on function public.get_profile(uuid) to authenticated, service_role;

/**
  Update a user's profile
 */

create or replace function public.update_profile(user_id uuid default auth.uid(), name text default null,
                                                 public_metadata jsonb default null,
                                                 replace_metadata boolean default false)
    returns jsonb
    language plpgsql
as
$$
declare
    profile_updated uuid;
begin
    -- if the user is not able to update the profile, throw an error
    update basejump.profiles p
    set name            = coalesce(update_profile.name, p.name),
        public_metadata = case
                              when update_profile.public_metadata is null then p.public_metadata -- do nothing
                              when p.public_metadata IS NULL then update_profile.public_metadata -- set metadata
                              when update_profile.replace_metadata
                                  then update_profile.public_metadata -- replace metadata
                              else p.public_metadata || update_profile.public_metadata end -- merge metadata
    where p.id = coalesce(update_profile.user_id, auth.uid())
    returning p.id into profile_updated;

    if profile_updated is null then
        raise exception 'Unauthorized';
    end if;

    return public.get_profile(coalesce(update_profile.user_id, auth.uid()));
end;
$$;

grant execute on function public.update_profile(uuid, text, jsonb, boolean) to authenticated, service_role;

/**
 * Returns the current user's role within a given account_id
*/
create or replace function public.current_user_account_role(lookup_account_id uuid)
    returns jsonb
    language plpgsql
as
$$
DECLARE
    response jsonb;
BEGIN

    select jsonb_build_object(
                   'account_role', wu.account_role,
                   'is_primary_owner', a.primary_owner_user_id = auth.uid(),
                   'is_personal_account', a.personal_account
               )
    into response
    from basejump.account_user wu
             join basejump.accounts a on a.id = wu.account_id
    where wu.user_id = auth.uid()
      and wu.account_id = lookup_account_id;

    -- if the user is not a member of the account, throw an error
    if response ->> 'account_role' IS NULL then
        raise exception 'Not found';
    end if;

    return response;
END
$$;

grant execute on function public.current_user_account_role(uuid) to authenticated;

/**
  * Returns the current billing status for an account
  * TODO: Add tests that confirm this raises an error if the user is not a member of the account
 */
CREATE OR REPLACE FUNCTION public.get_account_billing_status(lookup_account_id uuid)
    RETURNS jsonb
    security definer
    set search_path = public, basejump
AS
$$
DECLARE
    result          jsonb;
    role_result     jsonb;
    billing_enabled jsonb;
BEGIN
    select public.current_user_account_role(lookup_account_id) into role_result;

    -- pull billing status directly because otherwise we won't be able to load it since there may not be a subscription
    select jsonb_build_object(
                   'billing_enabled', config.enable_account_billing
               )
    into billing_enabled
    from basejump.config config
    limit 1;

    if billing_enabled ->> 'billing_enabled' = 'false' then
        return role_result || billing_enabled;
    end if;

    select jsonb_build_object(
                   'account_id', s.account_id,
                   'billing_subscription_id', s.id,
                   'billing_status', s.status,
                   'billing_customer_id', c.id,
                   'billing_provider', config.billing_provider,
                   'billing_default_plan_id', config.default_account_plan_id,
                   'billing_default_trial_days', config.default_trial_period_days,
                   'billing_email',
                   coalesce(c.email, u.email) -- if we don't have a customer email, use the user's email as a fallback
               )
    into result
    from basejump.accounts a
             join auth.users u on u.id = a.primary_owner_user_id
             left join basejump.billing_subscriptions s on s.account_id = a.id
             left join basejump.billing_customers c on c.account_id = s.account_id
             join basejump.config config on true
    where a.id = lookup_account_id
    order by s.created desc
    limit 1;

    return result || role_result || billing_enabled;
END;
$$ LANGUAGE plpgsql;

grant execute on function public.get_account_billing_status(uuid) to authenticated;

/**
  * Allow service accounts to upsert the billing data for an account
 */

CREATE OR REPLACE FUNCTION public.service_role_upsert_customer_subscription(account_id uuid default null,
                                                                            customer jsonb default null,
                                                                            subscription jsonb default null)
    RETURNS void AS
$$
BEGIN
    -- if the customer is not null, upsert the data into billing_customers, only upsert fields that are present in the jsonb object
    if customer is not null then
        insert into basejump.billing_customers (id, account_id, email, provider)
        values (customer ->> 'id', service_role_upsert_customer_subscription.account_id, customer ->> 'billing_email',
                (customer ->> 'provider')::basejump.billing_providers)
        on conflict (id) do update
            set email = customer ->> 'billing_email';
    end if;

    -- if the subscription is not null, upsert the data into billing_subscriptions, only upsert fields that are present in the jsonb object
    if subscription is not null then
        insert into basejump.billing_subscriptions (id, account_id, billing_customer_id, status, metadata, price_id,
                                                    quantity, cancel_at_period_end, created, current_period_start,
                                                    current_period_end, ended_at, cancel_at, canceled_at, trial_start,
                                                    trial_end, plan_name, provider)
        values (subscription ->> 'id', service_role_upsert_customer_subscription.account_id,
                subscription ->> 'billing_customer_id', (subscription ->> 'status')::basejump.subscription_status,
                subscription -> 'metadata',
                subscription ->> 'price_id', (subscription ->> 'quantity')::int,
                (subscription ->> 'cancel_at_period_end')::boolean,
                (subscription ->> 'created')::timestamptz, (subscription ->> 'current_period_start')::timestamptz,
                (subscription ->> 'current_period_end')::timestamptz, (subscription ->> 'ended_at')::timestamptz,
                (subscription ->> 'cancel_at')::timestamptz,
                (subscription ->> 'canceled_at')::timestamptz, (subscription ->> 'trial_start')::timestamptz,
                (subscription ->> 'trial_end')::timestamptz,
                subscription ->> 'plan_name', (subscription ->> 'provider')::basejump.billing_providers)
        on conflict (id) do update
            set billing_customer_id  = subscription ->> 'billing_customer_id',
                status               = (subscription ->> 'status')::basejump.subscription_status,
                metadata             = subscription -> 'metadata',
                price_id             = subscription ->> 'price_id',
                quantity             = (subscription ->> 'quantity')::int,
                cancel_at_period_end = (subscription ->> 'cancel_at_period_end')::boolean,
                current_period_start = (subscription ->> 'current_period_start')::timestamptz,
                current_period_end   = (subscription ->> 'current_period_end')::timestamptz,
                ended_at             = (subscription ->> 'ended_at')::timestamptz,
                cancel_at            = (subscription ->> 'cancel_at')::timestamptz,
                canceled_at          = (subscription ->> 'canceled_at')::timestamptz,
                trial_start          = (subscription ->> 'trial_start')::timestamptz,
                trial_end            = (subscription ->> 'trial_end')::timestamptz,
                plan_name            = subscription ->> 'plan_name';
    end if;
end;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION public.service_role_upsert_customer_subscription(uuid, jsonb, jsonb) TO service_role;


/**
  * Let's you update a users role within an account if you are an owner of that account
  **/
create or replace function public.update_account_user_role(account_id uuid, user_id uuid,
                                                           new_account_role basejump.account_role,
                                                           make_primary_owner boolean)
    returns void
    security definer
    set search_path = public
    language plpgsql
as
$$
declare
    is_account_owner         boolean;
    is_account_primary_owner boolean;
    changing_primary_owner   boolean;
begin
    -- check if the user is an owner, and if they are, allow them to update the role
    select (update_account_user_role.account_id IN
            (SELECT basejump.get_accounts_with_current_user_role('owner') AS get_accounts_with_current_user_role))
    into is_account_owner;

    if not is_account_owner then
        raise exception 'You must be an owner of the account to update a users role';
    end if;

    -- check if the user being changed is the primary owner, if so its not allowed
    select primary_owner_user_id = auth.uid(), primary_owner_user_id = update_account_user_role.user_id
    into is_account_primary_owner, changing_primary_owner
    from basejump.accounts
    where id = update_account_user_role.account_id;

    if changing_primary_owner = true and is_account_primary_owner = false then
        raise exception 'You must be the primary owner of the account to change the primary owner';
    end if;

    update basejump.account_user au
    set account_role = new_account_role
    where au.account_id = update_account_user_role.account_id
      and au.user_id = update_account_user_role.user_id;

    if make_primary_owner = true then
        -- first we see if the current user is the owner, only they can do this
        if is_account_primary_owner = false then
            raise exception 'You must be the primary owner of the account to change the primary owner';
        end if;

        update basejump.accounts
        set primary_owner_user_id = update_account_user_role.user_id
        where id = update_account_user_role.account_id;
    end if;
end;
$$;

grant execute on function public.update_account_user_role(uuid, uuid, basejump.account_role, boolean) to authenticated;

/**
  Returns the current user's accounts
 */
create or replace function public.get_accounts()
    returns json
    language sql
as
$$
select coalesce(json_agg(
                        json_build_object(
                                'id', wu.account_id,
                                'role', wu.account_role,
                                'is_primary_owner', a.primary_owner_user_id = auth.uid(),
                                'name', a.team_name,
                                'slug', a.slug,
                                'personal_account', a.personal_account,
                                'created_at', a.created_at,
                                'updated_at', a.updated_at
                            )
                    ), '[]'::json)
from basejump.account_user wu
         join basejump.accounts a on a.id = wu.account_id
where wu.user_id = auth.uid();
$$;

grant execute on function public.get_accounts() to authenticated;

/**
  Returns a specific account that the current user has access to
 */
create or replace function public.get_account(account_id uuid)
    returns json
    language plpgsql
as
$$
DECLARE
    members     json;
    invitations json;
BEGIN
    -- check if the user is a member of the account or a service_role user
    if current_user IN ('anon', 'authenticated') and
       (select current_user_account_role(get_account.account_id) ->> 'account_role' IS NULL) then
        raise exception 'You must be a member of an account to access it';
    end if;


    select json_agg(
                   json_build_object(
                           'user_id', wu.user_id,
                           'role', wu.account_role,
                           'name', p.name,
                           'is_primary_owner', a.primary_owner_user_id = auth.uid()
                       )
               )
    into members
    from basejump.account_user wu
             join basejump.profiles p on p.id = wu.user_id
             join basejump.accounts a on a.id = wu.account_id
    where wu.account_id = get_account.account_id;


    select json_agg(
                   json_build_object(
                           'role', i.account_role,
                           'created_at', i.created_at
                       )
               )
    into invitations
    from basejump.invitations i
    where i.account_id = get_account.account_id;

    return (select json_build_object(
                           'account_id', a.id,
                           'role', wu.account_role,
                           'is_primary_owner', a.primary_owner_user_id = auth.uid(),
                           'name', a.team_name,
                           'slug', a.slug,
                           'personal_account', a.personal_account,
                           'billing_status', bs.status,
                           'created_at', a.created_at,
                           'updated_at', a.updated_at,
                           'members', members,
                           'invitations', invitations,
                           'metadata', a.public_metadata
                       )
            from basejump.accounts a
                     left join basejump.account_user wu on a.id = wu.account_id and wu.user_id = auth.uid()
                     left join (select bs.account_id, status
                                from basejump.billing_subscriptions bs
                                where bs.account_id = get_account.account_id
                                order by created desc
                                limit 1) bs on bs.account_id = a.id
            where a.id = get_account.account_id);
END;
$$;

grant execute on function public.get_account(uuid) to authenticated, service_role;

/**
  Returns a specific account that the current user has access to
 */
create or replace function public.get_account_by_slug(slug text)
    returns json
    language plpgsql
as
$$
DECLARE
    internal_account_id uuid;
BEGIN
    select a.id
    into internal_account_id
    from basejump.accounts a
    where a.slug IS NOT NULL
      and a.slug = get_account_by_slug.slug;

    return public.get_account(internal_account_id);
END;
$$;

grant execute on function public.get_account_by_slug(text) to authenticated;

create or replace function public.create_account(slug text default null, team_name text default null)
    returns json
    language plpgsql
as
$$
DECLARE
    new_account_id uuid;
BEGIN
    insert into basejump.accounts (slug, team_name)
    values (create_account.slug, create_account.team_name)
    returning id into new_account_id;

    return public.get_account(new_account_id);
END;
$$;

grant execute on function public.create_account(slug text, team_name text) to authenticated;

/**
  Update an account with passed in info. None of the info is required except for account ID.
  If you don't pass in a value for a field, it will not be updated.
  If you set replace_meta to true, the metadata will be replaced with the passed in metadata.
  If you set replace_meta to false, the metadata will be merged with the passed in metadata.
 */
create or replace function public.update_account(account_id uuid, slug text default null, team_name text default null,
                                                 public_metadata jsonb default null,
                                                 replace_metadata boolean default false)
    returns json
    language plpgsql
as
$$
BEGIN

    -- check if postgres role is service_role
    if current_user IN ('anon', 'authenticated') and
       not (select current_user_account_role(update_account.account_id) ->> 'account_role' = 'owner') then
        raise exception 'Only account owners can update an account';
    end if;

    update basejump.accounts accounts
    set slug            = coalesce(update_account.slug, accounts.slug),
        team_name       = coalesce(update_account.team_name, accounts.team_name),
        public_metadata = case
                              when update_account.public_metadata is null then accounts.public_metadata -- do nothing
                              when accounts.public_metadata IS NULL then update_account.public_metadata -- set metadata
                              when update_account.replace_metadata
                                  then update_account.public_metadata -- replace metadata
                              else accounts.public_metadata || update_account.public_metadata end -- merge metadata
    where accounts.id = update_account.account_id;

    return public.get_account(account_id);
END;
$$;

grant execute on function public.update_account(uuid, text, text, jsonb, boolean) to authenticated, service_role;