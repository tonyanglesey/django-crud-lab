# Django CRUD Lab

This is a small task tracker that demonstrates the normal Django CRUD path:

- `tasks/models.py` defines the database table.
- `tasks/forms.py` defines the fields users can submit.
- `tasks/views.py` contains class-based create/read/update/delete views.
- `tasks/urls.py` maps browser URLs to views.
- `templates/tasks/` renders the pages.
- HTMX enhances the list page with partial swaps and modal forms while the regular URLs still work.
- `frontends/sveltekit/` contains a separate SvelteKit frontend that consumes the Django JSON API.

## Local Setup

```bash
source .venv/bin/activate
npm install
npm run build
createdb django_crud
python manage.py migrate
python manage.py runserver
```

Open <http://127.0.0.1:8000/>.

## Database SQL Script

Django migrations are the normal source of truth for the database schema. For reference or standalone Postgres demos, this repo also includes [database/init.sql](database/init.sql):

```bash
createdb django_crud
psql -d django_crud -f database/init.sql
```

If you are running the Django app, prefer:

```bash
python manage.py migrate
```

For Tailwind work, keep the CSS compiler running in a second terminal:

```bash
npm run watch:css
```

## SvelteKit Frontend

The `sveltekit-version` branch also includes a SvelteKit frontend that talks to Django through `/api/tasks/`.

Terminal 1:

```bash
source .venv/bin/activate
python manage.py runserver 127.0.0.1:8001
```

Terminal 2:

```bash
cd frontends/sveltekit
npm install
DJANGO_API_BASE_URL=http://127.0.0.1:8001/api npm run dev
```

Open <http://127.0.0.1:5173/>.

The app defaults to a local Postgres database named `django_crud`. Override these if needed:

```bash
export POSTGRES_DB=django_crud
export POSTGRES_USER=
export POSTGRES_PASSWORD=
export POSTGRES_HOST=
export POSTGRES_PORT=
```
