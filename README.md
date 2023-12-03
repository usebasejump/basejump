# Basejump

> If you're looking for the original Basejump which included a NextJS SaaS starter
> template, [check out the legacy repo](https://github.com/usebasejump/legacy-basejump-template).

Basejump adds personal accounts, team accounts, permissions and billing support to Supabase Auth.

[Learn more at usebasejump.com](https://usebasejump.com).

## Features

- **Personal accounts**: Every user that signs up using Supabase auth automatically gets their own personal account.
  Billing on personal accounts can be enabled/disabled.
- **Team accounts**: Team accounts are billable accounts that can be shared by multiple users. Team accounts can be
  disabled if you only wish to allow personal accounts. Billing on team accounts can also be disabled.
- **Permissions**: Permissions are handled using RLS, just like you're used to with Supabase. Basejump provides
  convenience methods that let you restrict access to rows based on a user's account access and role within an account
- **Billing**: Basejump provides out of the box billing support for Stripe, but you can add your own providers easily.
  If you do, please consider contributing them so others can benefit!
- **Testing**: Basejump is fully tested itself, but also provides a suite of testing tools that make it easier to test
  your own Supabase functions and schema. You can check it out
  at [database.dev/basejump/supabase_test_helpers](https://database.dev/basejump/supabase_test_helpers). You do not need
  to be using Basejump to use the testing tools.

## Quick Start (recommended)

Check out the getting started guide at [usebasejump.com](https://usebasejump.com).

## Contributing

Yes please! Here's how you can get started locally

#### Initialize Supabase

```bash
    supabase init && supabase start
```

#### Install dependencies using dbdev

1. Install dbdev according to instructions on [database.dev](https://database.dev).
2. Install supabase_test_helpers

```sql
    select dbdev.install('basejump-supabase_test_helpers');
```

#### Install local version of basejump_core

```bash
dbdev install --connection postgres://postgres:postgres@localhost:54322/postgres --path .
```

#### Enable basejump_core

```sql
    CREATE EXTENSION IF NOT EXISTS basejump_core with schema extensions;
```

#### Make sure tests can run

```bash
    supabase test db
```

### Add your changes and write tests.

Make sure you're following the database.dev upgrade guidelines. you should NEVER be updating/changing existing version
files. All changes should have valid migration files for postgres extensions. I'll try to flesh this section out more
later.
