# Todo App — Session Documentation

Record of everything done in this session to get the app saving data to the database.

## Project overview

- Next.js 16.3.0 (Turbopack), React 19, TypeScript
- `react-hook-form` + `zod` form validation
- `axios` for HTTP requests (presign S3 URL, upload to S3)
- **Suspense streaming**: form is a client component, todo list is a server component — they render independently via `<Suspense>`
- Form flow: validate -> presign S3 URL (`/api/uploads/presign`) -> upload file to S3 -> save S3 key + names to DB via server action
- Database: local PostgreSQL 18 (`localhost:5432`), also has local MySQL 8.0 (`localhost:3306`)

## Architecture

```
src/
├── app/
│   ├── page.tsx               ← server component (Suspense + TodoForm + TodoList)
│   ├── layout.tsx              ← root layout
│   ├── users/page.tsx          ← server component (arjun_adhikari users listing)
│   └── api/uploads/presign/    ← presign route handler for S3 uploads
├── components/
│   ├── TodoForm.tsx            ← client component (form, axios, react-hook-form)
│   └── TodoList.tsx            ← server component (queries DB, streams table)
├── lib/
│   ├── db.ts                   ← pg pool for `todo` database
│   ├── users-db.ts             ← pg pool for `arjun_adhikari` database
│   ├── actions/todos.ts        ← server action (createTodo only)
│   └── aws/s3.ts               ← S3 client config
```

### Suspense pattern

- `page.tsx` is a **server component** (no `"use client"`) — it imports both a client component (`TodoForm`) and a server component (`TodoList`)
- `<TodoList />` is wrapped in `<Suspense fallback={...}>` — streams in independently after the DB query resolves
- `<TodoForm />` is a `"use client"` component — renders instantly with react-hook-form + axios
- This avoids bundling `pg` for the browser (which would break if `TodoList` were imported into a client component)

## Problems found and fixed

### 1. `todos.ts` and `db.ts` were not connected

- `src/lib/actions/todos.ts` used Drizzle ORM syntax (`db.insert(todos)`) with a default import, but the project has no Drizzle — `src/lib/db.ts` uses `pg` and exports `pool` / `query`.
- Fixed: action now imports `{ query }` and runs parameterized raw SQL.

### 2. Credentials in `.env.local` did not exist

- The URL used role `user` with a wrong password -> Postgres: `role "user" does not exist`.
- The server only had the `postgres` role (empty password).
- Fixed: created a dedicated `todo_app` role (least-privilege best practice) with a generated password, granted `CONNECT` on database `todo` and `SELECT/INSERT, UPDATE, DELETE` on all tables + sequences in schema `public`.
- `.env.local` updated to `postgresql://todo_app:<password>@localhost:5432/todo` (password only in `.env.local`, which is git-ignored).

### 3. Database was actually named `"  todo"` (two leading spaces)

- A GUI showed `todo`, but the real name contained two invisible space characters -> `database "todo" does not exist`.
- Fixed: `ALTER DATABASE "  todo" RENAME TO todo;` (terminated a stale DataGrip connection first).

### 4. Wrong grants initially

- Grants were accidentally applied while connected to the `postgres` database instead of `todo` -> `permission denied for table users`.
- Fixed by re-applying the grants while connected to the `todo` database.

### 5. Table / column mismatches

- The `users` table already existed (created by the user) with columns: `id, firstname, lastname, photo, is_completed, created_at`.
- Action fixed to `INSERT INTO users (firstname, lastname, photo) VALUES ($1,$2,$3) RETURNING *`, reading the S3 `photokey` sent by the form (`page.tsx` uploads to S3 first, then sends `firstname`, `lastname`, `photokey`).
- A temporary `schema.sql` (wrong `todos` definition) was created earlier and later deleted — the real table is `users`.

### 6. `main` branch broken by accidental commit

- Commit `766badb` ("initial commit") on `main` stripped all dependencies from `package.json` and reverted `page.tsx` to the Create Next App starter.
- Fixed: restored `package.json`, `package-lock.json`, and `src/app/page.tsx` from `feat-server-actions`.

## Other database housekeeping

- Deleted PostgreSQL database `"Arjun Adhikari"` (was a duplicate/typo of `arjun_adhikari`).
- Created `arjun_adhikari` database with `users` table:

  ```sql
  CREATE TABLE users (
      id SERIAL PRIMARY KEY,
      rollno INTEGER UNIQUE NOT NULL,
      firstname VARCHAR(100) NOT NULL,
      lastname VARCHAR(100) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      address VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
  ```

  Seeded with 5 rows (rollno 101-105: Arjun Adhikari, Oliver Bennett, Emma Carter, Liam Anderson, Sophie Laurent).

- Confirmed MySQL 8.0 (root login) contains only: `information_schema, mysql, performance_schema, sys, unet` — no `todo` database there.

## Current state

- `npm run dev` boots clean, page returns HTTP 200 at `http://localhost:3000`.
- Home page (`/`): form submits to S3 + DB via server action; todo list streams in via Suspense (2 rows currently in `todo.users`).
- Users page (`/users`): lists 5 rows from `arjun_adhikari.users`.
- Verified end-to-end: real INSERT as `todo_app` succeeded; Suspense fallback shows while DB query resolves.

## Basic feature: `/users` page

- Simple server component at `src/app/users/page.tsx` that lists rows from the `arjun_adhikari` database (student sample data).
- Basic implementation only — one read-only query, no auth, no pagination.
- Dedicated connection in `src/lib/users-db.ts` (same `pg` pattern as `db.ts`) reading `USERS_DATABASE_URL`.
- Run the app and visit `http://localhost:3000/users`.

## Environment variables (`.env.local`, git-ignored)

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Main todo app connection (db `todo`, role `todo_app`) |
| `USERS_DATABASE_URL` | `/users` page connection (db `arjun_adhikari`, role `todo_app`) |
| `AWS_*` | S3 presign upload for the todo form photo |

## Files

| File | Type | Purpose |
|---|---|---|
| `src/app/page.tsx` | Server component | Home page — wraps TodoForm + TodoList in Suspense |
| `src/app/layout.tsx` | Server component | Root layout (fonts, CSS) |
| `src/app/users/page.tsx` | Server component | Users listing from `arjun_adhikari` DB |
| `src/app/api/uploads/presign/route.ts` | Route handler | Generates presigned S3 upload URL |
| `src/components/TodoForm.tsx` | Client component | Form: react-hook-form + zod + axios + S3 upload |
| `src/components/TodoList.tsx` | Server component | Queries `todo.users`, renders table |
| `src/lib/db.ts` | Utility | pg pool + `query` helper for `todo` database |
| `src/lib/users-db.ts` | Utility | pg pool + `usersQuery` helper for `arjun_adhikari` database |
| `src/lib/actions/todos.ts` | Server action | `createTodo` — inserts into `todo.users` |
| `src/lib/aws/s3.ts` | Utility | S3 client config (reads `AWS_*` env vars) |
| `.env.local` | Config | DB URLs + AWS credentials (git-ignored) |
| `DOCUMENTATION.md` | Docs | This file |
