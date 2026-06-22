# Django CRUD Lab

A small task-tracker CRUD app used to compare Django frontend approaches against the same Postgres-backed domain.

The baseline app is Django, Postgres, Tailwind CSS, and server-rendered templates. Other branches keep the same task model and add progressively different frontend stacks.

## Branch Map

| Branch | Frontend | What It Shows |
| --- | --- | --- |
| `django-templates` | Django templates | Plain server-rendered CRUD with class-based views. |
| `main` | Django templates + HTMX | The default branch, with partial swaps and modal form flows. |
| `htmx-version` | Django templates + HTMX | Explicit HTMX branch kept for comparison. |
| `sveltekit-version` | SvelteKit | SvelteKit consuming the Django JSON API. |
| `react-version` | React + Vite | Client-rendered React consuming the Django JSON API through a Vite proxy. |
| `nextjs-version` | Next.js | App Router, React Server Components, and route handlers proxying Django. |
| `angular-version` | Angular | Standalone Angular components, forms, and `HttpClient` against Django. |

## Main Branch Setup

The `main` branch runs as a normal Django app with Tailwind CSS and HTMX.

```bash
source .venv/bin/activate
npm install
npm run build
createdb django_crud
python manage.py migrate
python manage.py runserver
```

Open <http://127.0.0.1:8000/>.

For Tailwind work, keep the CSS compiler running in a second terminal:

```bash
npm run watch:css
```

## API Frontend Branches

The SvelteKit, React, Next.js, and Angular branches use Django as a JSON API. Run Django on port `8001` from the repo root:

```bash
source .venv/bin/activate
python manage.py runserver 127.0.0.1:8001
```

Then switch to the branch you want and start its frontend:

```bash
git switch react-version
cd frontends/react
npm install
npm run dev
```

Use the matching frontend folder for the other branches:

| Branch | Folder | Dev Command |
| --- | --- | --- |
| `sveltekit-version` | `frontends/sveltekit` | `npm run dev` |
| `react-version` | `frontends/react` | `npm run dev` |
| `nextjs-version` | `frontends/nextjs` | `npm run dev` |
| `angular-version` | `frontends/angular` | `npm run start` |

## Database

The app defaults to a local Postgres database named `django_crud`. Override these if needed:

```bash
export POSTGRES_DB=django_crud
export POSTGRES_USER=
export POSTGRES_PASSWORD=
export POSTGRES_HOST=
export POSTGRES_PORT=
```

Normal setup should use Django migrations:

```bash
python manage.py migrate
```

There is also a reference SQL script at `database/init.sql` for inspecting or bootstrapping the table shape manually.

## Test And Build

Run Django tests from the repo root:

```bash
python manage.py test
```

Build the active frontend branch from its frontend folder:

```bash
npm run build
```
