# Todo App — Session Documentation

Record of everything done in this session to get the app saving data to the database.

## Project overview

- Next.js 16.3.0 (Turbopack), React 19, TypeScript
- Server actions + `react-hook-form` + `zod` form validation
- Form flow: validate -> presign S3 URL (`/api/uploads/presign`) -> upload file to S3 -> save S3 key + names to DB
- Database: local PostgreSQL 18 (`localhost:5432`), also has local MySQL 8.0 (`localhost:3306`)

## Problems found and fixed

### 1. `todos.ts` and `db.ts` were not connected

- `src/lib/actions/todos.ts` used Drizzle ORM syntax (`db.insert(todos)`) with a default import, but the project has no Drizzle — `src/lib/db.ts` uses `pg` and exports `pool` / `query`.
- Fixed: action now imports `{ query }` and runs parameterized raw SQL.

### 2. Credentials in `.env.local` did not exist

- The URL used role `user` with a wrong password -> Postgres: `role "user" does not exist`.
- The server only had the `postgres` role (empty password).
- Fixed: created a dedicated `todo_app` role (least-privilege best practice) with a generated password, granted `CONNECT` on database `todo` and `SELECT/INSERT/UPDATE/DELETE` on all tables + sequences in schema `public`.
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
- Submitting the form persists a row into `todo.users` via the `todo_app` role.
- Verified end-to-end: real INSERT as `todo_app` succeeded (test row inserted then removed).

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

## Files touched this session

| File | Change |
|---|---|
| `src/lib/actions/todos.ts` | Rewrote to use `query` from `db.ts`; INSERT into `users`, reads `photokey` |
| `src/app/page.tsx` | Form now calls `createTodo` with FormData (`firstname`, `lastname`, `photokey`) |
| `src/lib/users-db.ts` | New: pg pool + `usersQuery` helper for the `arjun_adhikari` database |
| `src/app/users/page.tsx` | New: basic users listing page (server component) |
| `.env.local` | `DATABASE_URL` fixed to `todo_app` credentials; added `USERS_DATABASE_URL` (never commit; already git-ignored) |
| `schema.sql` | Created then deleted (not needed) |
| `DOCUMENTATION.md` | This file |
