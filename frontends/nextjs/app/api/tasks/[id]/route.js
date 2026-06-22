const DJANGO_API_BASE_URL = process.env.DJANGO_API_BASE_URL || 'http://127.0.0.1:8001/api';

async function proxy(request, id) {
  const response = await fetch(`${DJANGO_API_BASE_URL}/tasks/${id}/`, {
    method: request.method,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: request.method === 'GET' || request.method === 'DELETE' ? undefined : await request.text(),
    cache: 'no-store'
  });

  return Response.json(await response.json(), { status: response.status });
}

export async function GET(request, { params }) {
  const { id } = await params;
  return proxy(request, id);
}

export async function PATCH(request, { params }) {
  const { id } = await params;
  return proxy(request, id);
}

export async function DELETE(request, { params }) {
  const { id } = await params;
  return proxy(request, id);
}
