import { fail } from '@sveltejs/kit';

import { createTask, deleteTask, listTasks, updateTask } from '$lib/server/tasks';

function taskFromForm(formData) {
  return {
    title: String(formData.get('title') || ''),
    description: String(formData.get('description') || ''),
    status: String(formData.get('status') || 'todo'),
    priority: String(formData.get('priority') || 'medium'),
    due_date: String(formData.get('due_date') || '')
  };
}

function actionError(error, mode, values) {
  return fail(error.status || 500, {
    mode,
    values,
    errors: error.payload?.errors || {
      __all__: [error.message]
    }
  });
}

export async function load({ fetch, url }) {
  const status = url.searchParams.get('status') || '';
  const q = url.searchParams.get('q') || '';
  const payload = await listTasks(fetch, { status, q });

  return {
    ...payload,
    currentStatus: status,
    currentQuery: q
  };
}

export const actions = {
  create: async ({ request, fetch }) => {
    const formData = await request.formData();
    const values = taskFromForm(formData);

    try {
      await createTask(fetch, values);
      return { ok: true, mode: 'create' };
    } catch (error) {
      return actionError(error, 'create', values);
    }
  },

  update: async ({ request, fetch }) => {
    const formData = await request.formData();
    const id = String(formData.get('id') || '');
    const values = {
      id,
      ...taskFromForm(formData)
    };

    try {
      await updateTask(fetch, id, values);
      return { ok: true, mode: 'update' };
    } catch (error) {
      return actionError(error, 'update', values);
    }
  },

  delete: async ({ request, fetch }) => {
    const formData = await request.formData();
    const id = String(formData.get('id') || '');

    try {
      await deleteTask(fetch, id);
      return { ok: true, mode: 'delete' };
    } catch (error) {
      return actionError(error, 'delete', { id });
    }
  }
};
