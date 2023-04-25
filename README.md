# Basejump SaaS starter for Supabase

Basejump is an open source starter for Supabase. It provides personal accounts, shared team accounts, billing
subscriptions with Stripe and a dashboard template.

[Learn more at usebasejump.com](https://usebasejump.com).

## Installation

```bash
yarn
yarn dev
```

## Typescript and generated types

We've implemented automatic type generation based off of your Supabase database config. You can learn more about this
setup [in the supabase docs on type generation](https://supabase.com/docs/guides/api/generating-types)

To update your types, run:

```bash
yarn generate-types
```

You can then reference them as

```javascript
import Database from '@/types/supabase-types';

const profile: Database['public']['Tables']['profiles']['Row'] = {name: 'John Doe'};
```

## Code Formatting and linting

The project is configured to use ESLint and Prettier. Prettier is run through ESLint, not on its own.

* Prettier: [Prettier ESLint Plugin](https://github.com/prettier/eslint-plugin-prettier)
* ESLint: [NextJS ESLint](https://nextjs.org/docs/basic-features/eslint)

## Internationalizatoin and translations

Basejump uses NextJS built in internationalization, and adds `next-translate` for translation support.

* [NextJS Internationalization](https://nextjs.org/docs/basic-features/i18n)
* [next-translate](https://github.com/aralroca/next-translate)

## Thanks & Credits

<p>Hosting has generously been provided by Vercel</p>
<a
href="https://vercel.com?utm_source=basejump&utm_campaign=oss"
target="_blank"
rel="noopener noreferrer"
>
    <img src="public/images/vercel-logo.svg" alt="Powered by Vercel" />
</a>

