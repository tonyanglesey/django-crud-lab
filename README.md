# Django CRUD Learning App

This is a small task tracker that demonstrates the normal Django CRUD path:

- `tasks/models.py` defines the database table.
- `tasks/forms.py` defines the fields users can submit.
- `tasks/views.py` contains class-based create/read/update/delete views.
- `tasks/urls.py` maps browser URLs to views.
- `templates/tasks/` renders the pages.
- HTMX enhances the list page with partial swaps and modal forms while the regular URLs still work.

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

For Tailwind work, keep the CSS compiler running in a second terminal:

```bash
npm run watch:css
```

The app defaults to a local Postgres database named `django_crud`. Override these if needed:

```bash
export POSTGRES_DB=django_crud
export POSTGRES_USER=
export POSTGRES_PASSWORD=
export POSTGRES_HOST=
export POSTGRES_PORT=
```
