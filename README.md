# Basejump SaaS starter for Supabase

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

