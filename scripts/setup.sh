# install test helpers (remove once dbdev supports installing remote extensions)
psql -v ON_ERROR_STOP=1 -U postgres -d postgres -h localhost -p 54322 -f ./scripts/install-dbdev-with-test-helpers.sql
# install basejump_core
~/.cargo/bin/dbdev install --connection postgres://postgres:postgres@localhost:54322/postgres --path .
# create basejump_core extension
psql -v ON_ERROR_STOP=1 -U postgres -d postgres -h localhost -p 54322 -c 'CREATE EXTENSION IF NOT EXISTS basejump_core with schema extensions;'



