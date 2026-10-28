# ControlDesk

ControlDesk is a responsive e-commerce administration dashboard for managing a
small business's products, categories, stock, and catalog analytics. It is built
as a full-stack Next.js application with PostgreSQL, Prisma, Better Auth, and
TypeScript.

## Demo login

- **Email:** `nirmal@gmail.com`
- **Password:** `nirmal123`

> These credentials are for development/demo use only. Do not reuse them in a
> production environment.

## Project status

**Approximately 75% complete.**

### Completed

- Responsive dashboard with light and dark themes
- Email/password authentication and protected admin pages
- Category creation, listing, renaming, and restricted deletion
- Product creation, listing, viewing, editing, archiving, and restoring
- Product search, filtering, sorting, and pagination
- Live product, category, and inventory analytics
- Server-side validation and admin authorization
- Unit tests, linting, type checking, production build, and GitHub CI workflow

### Remaining

- Apply and verify the latest database hardening migration
- Add isolated database integration tests
- Add authenticated browser/E2E smoke tests
- Complete deployment and production smoke testing
- Finish release documentation and tag the first release

## Technology

- Next.js 16 and React 19
- TypeScript and Tailwind CSS
- shadcn/ui
- PostgreSQL and Prisma ORM
- Better Auth
- Vitest

## Run locally

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a `.env` file:

   ```env
   DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE"
   BETTER_AUTH_SECRET="replace-with-a-secure-random-secret"
   BETTER_AUTH_URL="http://localhost:3000"
   ```

3. Generate Prisma Client and apply approved migrations:

   ```bash
   npx prisma generate --config ./prisma7.config.ts
   npx prisma migrate deploy --config ./prisma7.config.ts
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000).

## Quality checks

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

More detailed requirements, implementation notes, and progress records are in
the [`docs`](./docs) directory.
