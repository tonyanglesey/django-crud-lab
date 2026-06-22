import TaskApp from './task-app';

const DJANGO_API_BASE_URL = process.env.DJANGO_API_BASE_URL || 'http://127.0.0.1:8001/api';

async function loadInitialTasks() {
  const response = await fetch(`${DJANGO_API_BASE_URL}/tasks/`, {
    cache: 'no-store'
  });

  if (!response.ok) {
    throw new Error('Unable to load tasks from Django.');
  }

  return response.json();
}

export default async function Page() {
  const initialData = await loadInitialTasks();
  return <TaskApp initialData={initialData} />;
}
