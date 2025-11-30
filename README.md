## Dynamic Form Builder

Full-stack assignment that lets admins compose complex forms (with nested conditional fields) and lets end-users submit responses that are persisted in MongoDB.

### Tech Stack
- **Frontend**: React 19, Vite, Tailwind v4, shadcn/ui-inspired primitives, TanStack Query, React Router
- **Backend**: Node.js 20, Express 5, Mongoose 9, Zod, JWT auth, Helmet, Morgan, cookie-parser
- **Database**: MongoDB 7
- **Tooling**: ESLint 9, Docker + Docker Compose, Nodemon (dev), Nginx (serving built frontend)

### Features
- Admin CRUD for forms, including per-field validation rules, option ordering, and nested follow-up fields for select/radio/checkbox choices.
- Public API to list forms, fetch a schema, and submit responses with server-side validation.
- Submission store records metadata (version, ip, etc.) so schema changes do not break historic responses.
- Email/password auth with JWT sessions stored in httpOnly cookies (admin/user roles).
- Secure Express setup (helmet, rate limit, sanitizers, validation via Zod).
- React admin panel with Tailwind+shadcn components, live preview powered by FormRenderer, and React Query for data fetching/mutations.
- Auth screens live in `pages/SignIn` and `pages/SignUp`. Create the first admin
  by signing up and selecting the *Admin* role.

### Environment Configuration
- Copy `env.example` to `server/.env` and `client/.env`, then update values as needed.
- Minimum variables:
  - Server: `PORT`, `MONGODB_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `CORS_ORIGINS`
  - Client: `VITE_API_BASE_URL`

### Local Development
Prerequisites: Node.js 22+, running MongoDB instance.

```bash
# Backend
cd server
npm install
npm run dev        # Express on :5000 with Nodemon

# Frontend (new terminal)
cd ../client
npm install
npm run dev        # Vite dev server on :5173
```

### Docker Setup
Requirements: Docker 24+ and Docker Compose.

```bash
docker compose up --build
```

- Frontend served via Nginx at `http://localhost:3000`
- Backend API available at `http://localhost:5000`
- MongoDB exposed on `mongodb://localhost:28017` (data persisted in the `mongo-data` volume)

Update the `docker-compose.yml` environment entries if you need different ports, credentials, or secrets. For production deployments, override `JWT_SECRET`, supply a managed MongoDB URI, and consider adding TLS termination or a reverse proxy in front of the services.

### API Overview
- `POST /api/admin/forms` (token) – create form.
- `PATCH /api/admin/forms/:id` (token) – update form/title/fields.
- `DELETE /api/admin/forms/:id` (token) – delete form + submissions.
- `POST /api/admin/forms/:id/fields` / `PATCH .../:fieldName` / `DELETE ...` – manage individual fields.
- `POST /api/admin/forms/:id/fields/reorder` – reorder by name list.
- `GET /api/admin/forms` / `GET /api/admin/forms/:id` – admin views.
- `GET /api/admin/forms/:id/submissions` – paginated submissions.
- `GET /api/forms` – public list with metadata.
- `GET /api/forms/:id` – public schema.
- `POST /api/forms/:id/submissions` – submit answers (server validates types, required, regex/min/max, nested conditions).

### Frontend Notes
- Tailwind v4 via `@tailwindcss/vite`.
- shadcn/ui-inspired primitives live in `client/src/components/ui`.
- Admin builder lives in `pages/CreateForm.tsx` with nested `FieldEditor`.
- Public preview + renderer uses `FormRenderer` component to recursively render fields and nested branches.
- React Query keys live in `client/src/api/forms.js`.
- `client/src/api/auth.js` centralizes auth/session helpers that power the protected routes.

### Testing
- `npm run build` inside `client/` ensures the React bundle compiles.
- Backend currently relies on runtime validation (Zod + Mongo tests). Add Jest or vitest if deeper coverage is required.

### Future Enhancements
- Add SSO providers (Google/Microsoft) on top of the email/password flow.
- Integrate drag-and-drop ordering (e.g., dnd-kit) for improved UX.
- Add CSV export endpoint for submissions.
- Harden Docker deployment with production-ready logging/monitoring.

