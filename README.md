# Alrifai App Demo

A bilingual English/Arabic education platform using Next.js, React, Tailwind CSS and Supabase. This finishing pass preserves the existing teal brand and public assets.

## Run locally

Use Node.js 20.9 or newer. Keep your existing `.env.local`, or copy `.env.example` and fill in the Supabase project URL and public anon key. Never put a service-role key in a `NEXT_PUBLIC_` variable.

```sh
npm install
npm run dev -- --hostname 127.0.0.1 --port 3003
```

Open http://127.0.0.1:3003/. For a production preview:

```sh
npm run build
npm run start -- --hostname 127.0.0.1 --port 3003
```

Supabase must contain the existing tables, RPC functions and profile setup used by this app. This repository does not include a database schema or policy migrations. The existing demo auto-sign-in is retained in `app/components/HomePage.tsx`; remove that flow before using this as a real school installation.

## Checks

```sh
npm run typecheck
npm run lint
npm test
npm run build
```

The score regression tests stub Supabase and never change database records. They verify integer limits and matching score updates/deletions by both name and group.

## Editing

- Global appearance: `app/globals.css`
- English/Arabic copy: `locales/en.ts` and `locales/ar.ts`
- Dashboard shortcuts: `app/components/UserProfile.tsx`
- Contact destination: `CONTACT_EMAIL` in `app/components/ContactForm.tsx`
- List loading and retries: `app/hooks/useAsyncList.ts` and `app/components/LoadError.tsx`
- Accessible dialogs: `app/components/Modal.tsx`
- Score persistence: `services/scoresService.ts`

Contact enquiries open the visitor's mail application addressed to **alrifaiorg@gmail.com**. Visitors send the message from their mail application. No email provider is configured for direct server delivery.

## Before real use

Verify Supabase row-level security and server-trusted role authorization against the actual database. Current frontend role checks and editable user metadata are not a substitute for database authorization. Test registration, profile creation and magic-link redirects with a separate test database and test inbox. Confirm the allowed redirect URLs in Supabase Auth.

No deployment or live database mutations were performed during this finishing pass. Public image assets retain their original files and resolution.
