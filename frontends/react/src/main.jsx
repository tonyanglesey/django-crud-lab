import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';

import './styles.css';

const blankTask = {
  title: '',
  description: '',
  status: 'todo',
  priority: 'medium',
  due_date: ''
};

const statusTone = {
  todo: 'bg-mist text-stone',
  in_progress: 'bg-gold-100 text-gold-700',
  done: 'bg-forest-50 text-forest-700'
};

const priorityTone = {
  low: 'bg-paper text-stone',
  medium: 'bg-paper text-stone',
  high: 'bg-clay-100 text-clay-800'
};

async function api(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: {
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers
    }
  });
  const payload = await response.json();

  if (!response.ok) {
    throw payload;
  }

  return payload;
}

function App() {
  const [tasks, setTasks] = useState([]);
  const [counts, setCounts] = useState({ total: 0, todo: 0, in_progress: 0, done: 0 });
  const [choices, setChoices] = useState({ statuses: [], priorities: [] });
  const [filters, setFilters] = useState({ status: '', q: '' });
  const [draft, setDraft] = useState(blankTask);
  const [editingId, setEditingId] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (filters.status) params.set('status', filters.status);
    if (filters.q) params.set('q', filters.q);
    return params.toString();
  }, [filters]);

  async function loadTasks() {
    setLoading(true);
    const payload = await api(`/api/tasks/${queryString ? `?${queryString}` : ''}`);
    setTasks(payload.tasks);
    setCounts(payload.counts);
    setChoices(payload.choices);
    setLoading(false);
  }

  useEffect(() => {
    loadTasks();
  }, [queryString]);

  function openCreate() {
    setEditingId(null);
    setDraft(blankTask);
    setErrors({});
  }

  function openEdit(task) {
    setEditingId(task.id);
    setDraft({
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      due_date: task.due_date
    });
    setErrors({});
  }

  async function submitTask(event) {
    event.preventDefault();
    setErrors({});

    try {
      if (editingId) {
        await api(`/api/tasks/${editingId}/`, {
          method: 'PATCH',
          body: JSON.stringify(draft)
        });
      } else {
        await api('/api/tasks/', {
          method: 'POST',
          body: JSON.stringify(draft)
        });
      }
      openCreate();
      await loadTasks();
    } catch (error) {
      setErrors(error.errors || { __all__: [error.error || 'Something went wrong.'] });
    }
  }

  async function deleteTask(id) {
    await api(`/api/tasks/${id}/`, { method: 'DELETE' });
    if (editingId === id) openCreate();
    await loadTasks();
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <header className="mb-8 grid gap-6 lg:grid-cols-[1fr_320px] lg:items-end">
        <div>
          <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.18em] text-forest-600">
            React frontend / Django API
          </p>
          <h1 className="font-display text-5xl font-bold leading-none tracking-tight text-ink sm:text-6xl">
            Tasks
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-stone">
            Vite React consumes the same Django JSON API with a client-side CRUD interface.
          </p>
        </div>
        <section className="rounded-lg border border-mist bg-white/85 p-4 shadow-soft">
          <p className="text-sm font-bold text-stone">Matching tasks</p>
          <p className="mt-1 font-display text-5xl font-bold leading-none">{counts.total}</p>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs font-bold text-stone">
            <div className="rounded-lg bg-mist/80 px-2 py-2"><span className="block text-lg text-ink">{counts.todo}</span>To do</div>
            <div className="rounded-lg bg-gold-100 px-2 py-2"><span className="block text-lg text-gold-700">{counts.in_progress}</span>Doing</div>
            <div className="rounded-lg bg-forest-50 px-2 py-2"><span className="block text-lg text-forest-700">{counts.done}</span>Done</div>
          </div>
        </section>
      </header>

      <section className="mb-6 grid gap-3 border-y border-mist py-4 lg:grid-cols-[1fr_auto] lg:items-center">
        <input
          className="w-full rounded-lg border border-mist bg-white px-4 py-2.5 text-sm text-ink shadow-sm outline-none transition placeholder:text-stone/70 focus:border-forest-600 focus:ring-4 focus:ring-forest-100 sm:w-80"
          value={filters.q}
          onChange={(event) => setFilters((current) => ({ ...current, q: event.target.value }))}
          placeholder="Search tasks"
        />
        <div className="flex flex-wrap gap-2 lg:justify-end">
          <button
            className={`rounded-lg px-4 py-2 text-sm font-bold transition ${!filters.status ? 'bg-ink text-white' : 'bg-white text-stone hover:bg-mist'}`}
            onClick={() => setFilters((current) => ({ ...current, status: '' }))}
            type="button"
          >
            All
          </button>
          {choices.statuses.map((status) => (
            <button
              className={`rounded-lg px-4 py-2 text-sm font-bold transition ${filters.status === status.value ? 'bg-ink text-white' : 'bg-white text-stone hover:bg-mist'}`}
              key={status.value}
              onClick={() => setFilters((current) => ({ ...current, status: status.value }))}
              type="button"
            >
              {status.label}
            </button>
          ))}
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[360px_1fr]">
        <form className="rounded-lg border border-mist bg-white/90 p-5 shadow-soft" onSubmit={submitTask}>
          <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.18em] text-forest-600">
            {editingId ? 'Edit through React' : 'Create through React'}
          </p>
          <h2 className="font-display text-3xl font-bold">{editingId ? 'Edit task' : 'New task'}</h2>
          {errors.__all__?.map((error) => (
            <p className="mt-4 rounded-lg bg-clay-100 p-3 text-sm font-semibold text-clay-800" key={error}>{error}</p>
          ))}

          <TaskField label="Title" errors={errors.title}>
            <input className="field-control" required value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} />
          </TaskField>
          <TaskField label="Description" errors={errors.description}>
            <textarea className="field-control" rows="4" value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} />
          </TaskField>
          <TaskField label="Status" errors={errors.status}>
            <select className="field-control" value={draft.status} onChange={(event) => setDraft({ ...draft, status: event.target.value })}>
              {choices.statuses.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}
            </select>
          </TaskField>
          <TaskField label="Priority" errors={errors.priority}>
            <select className="field-control" value={draft.priority} onChange={(event) => setDraft({ ...draft, priority: event.target.value })}>
              {choices.priorities.map((priority) => <option key={priority.value} value={priority.value}>{priority.label}</option>)}
            </select>
          </TaskField>
          <TaskField label="Due date" errors={errors.due_date}>
            <input className="field-control" type="date" value={draft.due_date} onChange={(event) => setDraft({ ...draft, due_date: event.target.value })} />
          </TaskField>

          <div className="mt-5 flex flex-wrap gap-3">
            <button className="rounded-lg bg-forest-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-forest-700 focus:outline-none focus:ring-4 focus:ring-forest-100" type="submit">
              {editingId ? 'Save task' : 'Create task'}
            </button>
            {editingId && (
              <button className="rounded-lg border border-mist bg-white px-5 py-3 text-sm font-bold text-ink transition hover:bg-paper" onClick={openCreate} type="button">
                Cancel
              </button>
            )}
          </div>
        </form>

        {loading ? (
          <section className="rounded-lg border border-mist bg-white/80 p-10 text-center shadow-soft">Loading tasks...</section>
        ) : tasks.length ? (
          <section className="grid gap-4 sm:grid-cols-2" aria-label="Task list">
            {tasks.map((task) => (
              <article className="flex min-h-64 flex-col rounded-lg border border-mist bg-white/90 p-5 shadow-soft transition hover:-translate-y-0.5 hover:border-forest-100" key={task.id}>
                <div className="flex items-center justify-between gap-3">
                  <span className={`rounded-full px-3 py-1 text-xs font-extrabold ${statusTone[task.status]}`}>{task.status_label}</span>
                  <span className={`rounded-full px-3 py-1 text-xs font-extrabold ${priorityTone[task.priority]}`}>{task.priority_label}</span>
                </div>
                <h2 className="mt-5 font-display text-2xl font-bold leading-tight text-ink">{task.title}</h2>
                <p className="mt-3 leading-7 text-stone">{task.description || 'No description yet.'}</p>
                <div className="mt-auto flex items-center justify-between gap-4 border-t border-mist pt-4 text-sm font-semibold text-stone">
                  <span>{task.due_date ? `Due ${task.due_date}` : 'No due date'}</span>
                  <div className="flex gap-3">
                    <button className="text-forest-700 hover:text-forest-900" onClick={() => openEdit(task)} type="button">Edit</button>
                    <button className="text-clay-700 hover:text-clay-800" onClick={() => deleteTask(task.id)} type="button">Delete</button>
                  </div>
                </div>
              </article>
            ))}
          </section>
        ) : (
          <section className="rounded-lg border border-dashed border-forest-100 bg-white/80 p-10 text-center shadow-soft">
            <h2 className="font-display text-3xl font-bold">No tasks found</h2>
            <p className="mx-auto mt-3 max-w-md leading-7 text-stone">Adjust the filters or create a new task.</p>
          </section>
        )}
      </section>
    </main>
  );
}

function TaskField({ label, errors = [], children }) {
  return (
    <label className="mt-5 block text-sm font-extrabold text-ink">
      {label}
      {children}
      {errors.map((error) => (
        <p className="mt-2 text-sm font-semibold text-clay-800" key={error}>{error}</p>
      ))}
    </label>
  );
}

createRoot(document.getElementById('root')).render(<App />);
