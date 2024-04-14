# Basejump

Basejump adds personal accounts, team accounts, permissions and billing support to Supabase Auth.

[Learn more at usebasejump.com](https://usebasejump.com). Ask questions [on X / Twitter](https://twitter.com/tiniscule)

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

<br/><br/>


# Quick Start

Check out the getting started guide at [usebasejump.com](https://usebasejump.com).
<br/>

## Optional Nextjs starter template
We've got a fleshed out starter template ready to go for Basejump built using NextJs.  You can install it by running:

```bash
yarn create next-app -e https://github.com/usebasejump/basejump-next
```

Then add your Supabase URL and anon key to your `.env.local` file. There's an example in the `.env.example` file.

> Note: create-next-app forces you to install the template into a nested directory. You can move the contents of the directory to the root of your project if you'd like.

<br/><br/>

## Running tests
Basejump includes comprehensive pgtap testing for all included functionality - but it's not enabled by default in case that's not your jam. To run the tests, you'll need to add a few dependencies.

#### Install pgtap

```sql
create extension pgtap with schema extensions;
```

#### Install dbdev
Follow the directions at [database.dev](https://database.dev/supabase/dbdev) to install dbdev.

#### Install supabase_test_helpers

```sql
select dbdev.install('basejump-supabase_test_helpers');
```

#### Run the tests
```bash
supabase test db
```

<br/><br/>

## Contributing

Yes please! Please submit a PR with your changes to [the basejump github repo](https://github.com/usebasejump/basejump). Please make sure your changes are well tested and documented.

You can contribute in the following places:
- [Basejump core](https://github.com/usebasejump/basejump)
- [Basejump edge functions / billing functions](https://github.com/usebasejump/basejump-deno-packages)