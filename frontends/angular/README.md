# Django CRUD Angular Frontend

This branch keeps Django and Postgres as the backend, then adds an Angular frontend that talks to the shared Django JSON API.

## Run Locally

Start Django from the repo root:

```bash
python manage.py runserver 127.0.0.1:8001
```

Start Angular from this folder:

```bash
npm install
npm run start
```

Angular runs on `http://127.0.0.1:4200` and proxies `/api` requests to Django on `http://127.0.0.1:8001`.

## What This Shows

- Standalone Angular components
- Template-driven forms
- Angular `HttpClient`
- A local dev proxy to avoid browser CORS issues
- The same CRUD flow used by the Django template, HTMX, SvelteKit, React, and Next.js branches

## Useful Commands

Build the frontend:

```bash
npm run build
```

Check frontend dependencies:

```bash
npm audit --audit-level=moderate
```
Run Django tests from the repo root:

```bash
python manage.py test
```
