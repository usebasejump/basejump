/**
 * We want to enable pgtap for testing
 */
create extension if not exists pgtap with schema extensions;
select dbdev.install('basejump-supabase_test_helpers');

/**
  * By default we want to revoke execute from public
 */
ALTER DEFAULT PRIVILEGES REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;
ALTER DEFAULT PRIVILEGES IN SCHEMA PUBLIC REVOKE EXECUTE ON FUNCTIONS FROM anon, authenticated;

/**
  Create a schema for us to use for private functions
 */
CREATE SCHEMA IF NOT EXISTS basejump;
GRANT USAGE ON SCHEMA basejump to authenticated;
GRANT USAGE ON SCHEMA basejump to service_role;

CREATE TABLE IF NOT EXISTS basejump.config
(
    enable_personal_accounts boolean default true,
    enable_team_accounts     boolean default true
);

-- enable select on the config table
GRANT SELECT ON basejump.config TO authenticated, service_role;

-- enable RLS on config
ALTER TABLE basejump.config
    ENABLE ROW LEVEL SECURITY;

create policy "Basejump settings can be read by authenticated users" on basejump.config
    for select
    to authenticated
    using (
    true
    );

/**
  Get the full config object to check basejump settings
  This is not accessible fromt he outside, so can only be used inside postgres functions
 */
CREATE OR REPLACE FUNCTION basejump.get_config()
    RETURNS json AS
$$
DECLARE
    result RECORD;
BEGIN
    SELECT * from basejump.config limit 1 into result;
    return row_to_json(result);
END;
$$ LANGUAGE plpgsql;

grant execute on function basejump.get_config() to authenticated;

/**
  Sometimes it's useful for supabase admin clients to access settings
  but we dont' want to expose this to anyone else, so it's not granted to anyone but
  the service key
 */
CREATE OR REPLACE FUNCTION public.get_service_role_config()
    RETURNS json AS
$$
DECLARE
    result RECORD;
BEGIN
    SELECT * from basejump.config limit 1 into result;
    return row_to_json(result);
END;
$$ LANGUAGE plpgsql;

/**
  Check a specific boolean config value
 */
CREATE OR REPLACE FUNCTION basejump.is_set(field_name text)
    RETURNS boolean AS
$$
DECLARE
    result BOOLEAN;
BEGIN
    execute format('select %I from basejump.config limit 1', field_name) into result;
    return result;
END;
$$ LANGUAGE plpgsql;

grant execute on function basejump.is_set(text) to authenticated;


/**
  * Automatic handling for maintaining created_at and updated_at timestamps
  * on tables
 */
CREATE OR REPLACE FUNCTION basejump.trigger_set_timestamps()
    RETURNS TRIGGER AS
$$
BEGIN
    if TG_OP = 'INSERT' then
        NEW.created_at = now();
        NEW.updated_at = now();
    else
        NEW.updated_at = now();
        NEW.created_at = OLD.created_at;
    end if;
    RETURN NEW;
END
$$ LANGUAGE plpgsql;

/**
  Generates a secure token - used internally for invitation tokens
  but could be used elsewhere.  Check out the invitations table for more info on
  how it's used
 */
CREATE OR REPLACE FUNCTION basejump.generate_token(length int)
    RETURNS bytea AS
$$
BEGIN
    return replace(replace(replace(encode(gen_random_bytes(length)::bytea, 'base64'), '/', '-'), '+', '_'), '\', '-');
END
$$ LANGUAGE plpgsql;

grant execute on function basejump.generate_token(int) to authenticated;

-- TODO: is this needed?
-- CREATE OR REPLACE FUNCTION trigger_id_protection()
--     RETURNS TRIGGER AS
-- $$
-- BEGIN
--     NEW.id = OLD.id;
--     RETURN NEW;
-- END
-- $$ LANGUAGE plpgsql;