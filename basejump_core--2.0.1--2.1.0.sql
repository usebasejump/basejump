/**
      ____                 _
     |  _ \               (_)
     | |_) | __ _ ___  ___ _ _   _ _ __ ___  _ __
     |  _ < / _` / __|/ _ \ | | | | '_ ` _ \| '_ \
     | |_) | (_| \__ \  __/ | |_| | | | | | | |_) |
     |____/ \__,_|___/\___| |\__,_|_| |_| |_| .__/
                         _/ |               | |
                        |__/                |_|

    Version: 2.1.0
    Recreate all functions with improved response types that allow better type
    generation from Supabase.
 */

/**
 * Returns the current user's role within a given account_id
*/
drop function if exists public.current_user_account_role(uuid);

create type basejump.current_user_account_role_response as (
    account_role text,
    is_primary_owner boolean,
    is_personal_account boolean
);

create or replace function public.current_user_account_role(account_id uuid)
    returns basejump.current_user_account_role_response
    language plpgsql
as
$$
DECLARE
    response basejump.current_user_account_role_response;
BEGIN

    select 
        wu.role as account_role,
        wu.is_primary_owner,
        a.is_personal as is_personal_account
    into response
    from basejump.account_user wu
             join basejump.accounts a on a.id = wu.account_id
    where wu.user_id = auth.uid()
      and wu.account_id = current_user_account_role.account_id;

    -- if the user is not a member of the account, throw an error
    if response.account_role is null then
        raise exception 'Not found';
    end if;

    return response;
END
$$;

grant execute on function public.current_user_account_role(uuid) to authenticated;