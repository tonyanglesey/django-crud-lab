const DJANGO_API_BASE_URL = process.env.DJANGO_API_BASE_URL || 'http://127.0.0.1:8001/api';

async function proxy(request, path) {
  const response = await fetch(`${DJANGO_API_BASE_URL}${path}`, {
    method: request.method,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: request.method === 'GET' ? undefined : await request.text(),
    cache: 'no-store'
  });

  return Response.json(await response.json(), { status: response.status });
}

export async function GET(request) {
  const query = request.nextUrl.search;
  return proxy(request, `/tasks/${query}`);
}

export async function POST(request) {
  return proxy(request, '/tasks/');
}
