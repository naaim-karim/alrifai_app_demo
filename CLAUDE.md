# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server with Turbopack
npm run build    # Production build
npm run lint     # ESLint check
npm run start    # Start production server
```

There are no tests in this project.

## Environment Variables

Required in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_APP_URL` — used as the magic-link redirect base

## Architecture

This is a **Next.js 16 App Router** project with **Supabase** as the backend (auth + database + storage). There is no dedicated API layer; the app queries Supabase directly from the client and from Server Actions.

### Auth Flow

Authentication is **magic-link only** (passwordless OTP via `supabase.auth.signInWithOtp`). The flow differs for sign-in vs sign-up:

- **Sign-in**: `shouldCreateUser: false` — rejects emails not already in the system.
- **Sign-up**: `shouldCreateUser: true` — passes all profile fields (fullname, username, group, role, profileImageUrl, etc.) in the `data` option, which Supabase stores in `user_metadata`.

After either flow, the user is redirected to `/check-email`. The middleware (`middleware.ts`) guards this route via a short-lived `fromAuth` cookie — navigating to `/check-email` without that cookie redirects to `/`. The cookie is consumed on first access.

`AuthContext` (`contexts/AuthContext.tsx`) is the single source of auth state. It wraps the app in `layout.tsx` and exposes `user`, `loading`, `signInWithMagicLink`, `signUpWithMagicLink`, and `signOut`. Components access it via the `useAuth()` hook.

User profile data lives in `user.user_metadata` (populated at sign-up time), not in a separate API call.

### User Roles & Profiles

There are three roles: **student**, **admin**, **teacher**.

- Students are stored in `student_profiles` table.
- Admins and teachers share the `teacher_profiles` table, distinguished by a `role` column.
- Profile pages live at `/u/student/[username]`, `/u/admin/[username]`, `/u/teacher/[username]`.
- Registration flows: `/new-user/student` and `/new-user/admin` (admin flow also covers teachers via a role dropdown).

### Form System

Forms use a config-driven pattern:
1. A `FormField[]` config array (e.g. `signUpFormConfig.ts`, `signInFormConfig.ts`) declares fields with name, type, label, and a `validation` function.
2. `useFormFields` hook (`app/hooks/useFormFields.ts`) manages values, errors, refs, and per-field validation. It also persists non-file field values to `localStorage` so the form survives page refreshes.
3. A **Server Action** (`action.ts` co-located with each page) re-validates the `FormData` server-side using `validateFormData` from `lib/validations.ts`, then returns a typed `SignUpResult` or `SignInResult`.
4. A hook like `useSignInMagicLink` or `useSignUpMagicLink` wires the Server Action to the auth context using React's `useActionState`.

### Validation

`lib/validations.ts` exports:
- Primitive validators in the `validations` object (e.g. `validations.required`, `validations.email`).
- `createValidator(...validators)` — composes validators left-to-right, stopping at first error.
- Pre-composed `fieldValidators` for each field type (fullname, username, email, etc.).
- `validateFormData(data, schema)` — runs a schema of validators against a data object, returns `{ isValid, errors }`.

Username uniqueness validation fetches all existing usernames from Supabase and caches them in module-level variables for the lifetime of the page (simple in-memory cache, no invalidation).

### Services Layer

`services/` contains thin Supabase query wrappers — no business logic. Each function returns the data shape or `[{ error }]` on failure:
- `groupService.ts` — fetch groups list, fetch group members
- `studentsService.ts` — fetch all students
- `lessonsService.ts` — fetch lessons for a group (joins `group_lessons` → `lessons`)
- `storageService.ts` — upload profile image to `profile-images` bucket, returns public URL
- `usernameService.ts` — fetch usernames per role (used by validation)

### Styling

Tailwind CSS v4 with a custom theme. Brand colors are defined in `globals.css`:
- `--color-primary: #435d5a` (dark teal)
- `--color-secondary: #6b7a75`

Reusable utility classes in `globals.css`: `.btn`, `.light-btn`, `.dark-btn`, `.input`, `.label`, `.main-container`, `.loading`, `.mobile-nav`.

### Navigation

`Navbar` renders `DesktopNavbar` and `MobileNavbar` conditionally via CSS (not JS). The desktop navbar uses a mega-menu with CSS classes `.mega-menu-opened` / `.mega-menu-closed` for show/hide transitions.

### Images

Next.js `<Image>` is used throughout. The Supabase storage domain is whitelisted in `next.config.ts` via `remotePatterns`.
