<script>
  import { enhance } from '$app/forms';

  let { data, form } = $props();

  let modal = $state(null);
  let editingTask = $state(null);

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

  $effect(() => {
    if (form?.mode === 'create' && form?.errors) {
      modal = 'create';
    }

    if (form?.mode === 'update' && form?.errors) {
      modal = 'edit';
      editingTask = data.tasks.find((task) => String(task.id) === String(form.values?.id)) || editingTask;
    }
  });

  function openCreate() {
    editingTask = null;
    modal = 'create';
  }

  function openEdit(task) {
    editingTask = task;
    modal = 'edit';
  }

  function closeModal() {
    modal = null;
    editingTask = null;
  }

  function enhanceAndClose() {
    return async ({ result, update }) => {
      await update({ reset: false });
      if (result.type === 'success') {
        closeModal();
      }
    };
  }

  function modalMode() {
    return modal === 'edit' ? 'update' : 'create';
  }

  function fieldValue(name, fallback = '') {
    if (form?.mode === modalMode() && form.values?.[name] !== undefined) {
      return form.values[name];
    }

    return fallback || '';
  }

  function errorsFor(name) {
    if (form?.mode !== modalMode()) {
      return [];
    }

    return form.errors?.[name] || [];
  }
</script>

<svelte:head>
  <title>SvelteKit CRUD | Django API</title>
  <meta
    name="description"
    content="A SvelteKit frontend consuming the Django task API."
  />
</svelte:head>

<main class="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
  <header class="mb-8 grid gap-6 lg:grid-cols-[1fr_320px] lg:items-end">
    <div>
      <p class="mb-3 text-xs font-extrabold uppercase tracking-[0.18em] text-forest-600">
        SvelteKit frontend / Django API
      </p>
      <h1 class="font-display text-5xl font-bold leading-none tracking-tight text-ink sm:text-6xl">
        Tasks
      </h1>
      <p class="mt-4 max-w-2xl text-lg leading-8 text-stone">
        Same Postgres data, this time rendered by SvelteKit through server-side loads and form actions.
      </p>
    </div>

    <section class="rounded-lg border border-mist bg-white/85 p-4 shadow-soft" aria-label="Task counts">
      <p class="text-sm font-bold text-stone">Matching tasks</p>
      <p class="mt-1 font-display text-5xl font-bold leading-none">{data.counts.total}</p>
      <div class="mt-4 grid grid-cols-3 gap-2 text-center text-xs font-bold text-stone">
        <div class="rounded-lg bg-mist/80 px-2 py-2">
          <span class="block text-lg text-ink">{data.counts.todo}</span>
          To do
        </div>
        <div class="rounded-lg bg-gold-100 px-2 py-2">
          <span class="block text-lg text-gold-700">{data.counts.in_progress}</span>
          Doing
        </div>
        <div class="rounded-lg bg-forest-50 px-2 py-2">
          <span class="block text-lg text-forest-700">{data.counts.done}</span>
          Done
        </div>
      </div>
    </section>
  </header>

  <section class="mb-5 grid gap-3 border-y border-mist py-4 lg:grid-cols-[1fr_auto] lg:items-center">
    <form class="flex flex-col gap-3 sm:flex-row sm:items-center" method="GET">
      {#if data.currentStatus}
        <input type="hidden" name="status" value={data.currentStatus} />
      {/if}
      <label class="sr-only" for="task-search">Search tasks</label>
      <input
        id="task-search"
        class="w-full rounded-lg border border-mist bg-white px-4 py-2.5 text-sm text-ink shadow-sm outline-none transition placeholder:text-stone/70 focus:border-forest-600 focus:ring-4 focus:ring-forest-100 sm:w-80"
        type="search"
        name="q"
        value={data.currentQuery}
        placeholder="Search tasks"
      />
      <button
        class="rounded-lg border border-mist bg-white px-4 py-2.5 text-sm font-bold text-ink transition hover:bg-paper focus:outline-none focus:ring-4 focus:ring-forest-100"
        type="submit"
      >
        Search
      </button>
    </form>

    <div class="flex flex-wrap gap-2 lg:justify-end" aria-label="Filter tasks by status">
      <a
        class={`rounded-lg px-4 py-2 text-sm font-bold transition ${
          !data.currentStatus ? 'bg-ink text-white' : 'bg-white text-stone hover:bg-mist'
        }`}
        href={data.currentQuery ? `/?q=${encodeURIComponent(data.currentQuery)}` : '/'}
      >
        All
      </a>
      {#each data.choices.statuses as status}
        <a
          class={`rounded-lg px-4 py-2 text-sm font-bold transition ${
            data.currentStatus === status.value
              ? 'bg-ink text-white'
              : 'bg-white text-stone hover:bg-mist'
          }`}
          href={`/?status=${status.value}${data.currentQuery ? `&q=${encodeURIComponent(data.currentQuery)}` : ''}`}
        >
          {status.label}
        </a>
      {/each}
      <button
        class="inline-flex items-center justify-center rounded-lg bg-forest-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-forest-700 focus:outline-none focus:ring-4 focus:ring-forest-100"
        type="button"
        onclick={openCreate}
      >
        Add task
      </button>
    </div>
  </section>

  {#if data.tasks.length}
    <section class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label="Task list">
      {#each data.tasks as task}
        <article class="flex min-h-64 flex-col rounded-lg border border-mist bg-white/90 p-5 shadow-soft transition hover:-translate-y-0.5 hover:border-forest-100">
          <div class="flex items-center justify-between gap-3">
            <span class={`rounded-full px-3 py-1 text-xs font-extrabold ${statusTone[task.status]}`}>
              {task.status_label}
            </span>
            <span class={`rounded-full px-3 py-1 text-xs font-extrabold ${priorityTone[task.priority]}`}>
              {task.priority_label}
            </span>
          </div>

          <h2 class="mt-5 font-display text-2xl font-bold leading-tight text-ink">{task.title}</h2>
          <p class="mt-3 leading-7 text-stone">
            {task.description || 'No description yet.'}
          </p>

          <div class="mt-auto flex items-center justify-between gap-4 border-t border-mist pt-4 text-sm font-semibold text-stone">
            <span>{task.due_date ? `Due ${task.due_date}` : 'No due date'}</span>
            <div class="flex gap-3">
              <button
                class="text-forest-700 hover:text-forest-900"
                type="button"
                onclick={() => openEdit(task)}
              >
                Edit
              </button>
              <form method="POST" action="?/delete" use:enhance={enhanceAndClose}>
                <input type="hidden" name="id" value={task.id} />
                <button class="text-clay-700 hover:text-clay-800" type="submit">Delete</button>
              </form>
            </div>
          </div>
        </article>
      {/each}
    </section>
  {:else}
    <section class="rounded-lg border border-dashed border-forest-100 bg-white/80 p-10 text-center shadow-soft">
      <h2 class="font-display text-3xl font-bold">No tasks found</h2>
      <p class="mx-auto mt-3 max-w-md leading-7 text-stone">
        Adjust the filters or create a new task through the SvelteKit form.
      </p>
      <button
        class="mt-6 inline-flex items-center justify-center rounded-lg bg-forest-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-forest-700 focus:outline-none focus:ring-4 focus:ring-forest-100"
        type="button"
        onclick={openCreate}
      >
        Create task
      </button>
    </section>
  {/if}
</main>

{#if modal}
  <div class="fixed inset-0 z-50 grid place-items-center bg-ink/45 px-4 py-6" role="dialog" aria-modal="true">
    <button class="absolute inset-0 cursor-default" type="button" aria-label="Close modal" onclick={closeModal}></button>

    <section class="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg border border-mist bg-white p-6 shadow-soft sm:p-8">
      <button
        class="absolute right-4 top-4 rounded-lg px-3 py-2 text-sm font-bold text-stone transition hover:bg-paper hover:text-ink"
        type="button"
        onclick={closeModal}
      >
        Close
      </button>

      <p class="mb-3 text-xs font-extrabold uppercase tracking-[0.18em] text-forest-600">
        {modal === 'edit' ? 'Update through Django API' : 'Create through Django API'}
      </p>
      <h2 class="font-display text-4xl font-bold leading-tight tracking-tight text-ink">
        {modal === 'edit' ? 'Edit task' : 'New task'}
      </h2>

      <form
        method="POST"
        action={modal === 'edit' ? '?/update' : '?/create'}
        class="mt-8 grid gap-5"
        use:enhance={enhanceAndClose}
      >
        {#if modal === 'edit'}
          <input type="hidden" name="id" value={fieldValue('id', editingTask?.id)} />
        {/if}

        {#if errorsFor('__all__').length}
          <div class="rounded-lg bg-clay-100 p-4 text-sm font-semibold text-clay-800">
            {errorsFor('__all__').join(' ')}
          </div>
        {/if}

        <div>
          <label class="text-sm font-extrabold text-ink" for="title">Title</label>
          <input
            id="title"
            class="mt-2 w-full rounded-lg border border-mist bg-white px-4 py-3 text-ink shadow-sm outline-none transition focus:border-forest-600 focus:ring-4 focus:ring-forest-100"
            name="title"
            value={fieldValue('title', editingTask?.title)}
            required
          />
          {#each errorsFor('title') as error}
            <p class="mt-2 text-sm font-semibold text-clay-800">{error}</p>
          {/each}
        </div>

        <div>
          <label class="text-sm font-extrabold text-ink" for="description">Description</label>
          <textarea
            id="description"
            class="mt-2 w-full rounded-lg border border-mist bg-white px-4 py-3 text-ink shadow-sm outline-none transition focus:border-forest-600 focus:ring-4 focus:ring-forest-100"
            name="description"
            rows="4"
            value={fieldValue('description', editingTask?.description)}
          ></textarea>
          {#each errorsFor('description') as error}
            <p class="mt-2 text-sm font-semibold text-clay-800">{error}</p>
          {/each}
        </div>

        <div class="grid gap-5 sm:grid-cols-2">
          <div>
            <label class="text-sm font-extrabold text-ink" for="status">Status</label>
            <select
              id="status"
              class="mt-2 w-full rounded-lg border border-mist bg-white px-4 py-3 text-ink shadow-sm outline-none transition focus:border-forest-600 focus:ring-4 focus:ring-forest-100"
              name="status"
              value={fieldValue('status', editingTask?.status || 'todo')}
            >
              {#each data.choices.statuses as status}
                <option value={status.value}>{status.label}</option>
              {/each}
            </select>
            {#each errorsFor('status') as error}
              <p class="mt-2 text-sm font-semibold text-clay-800">{error}</p>
            {/each}
          </div>

          <div>
            <label class="text-sm font-extrabold text-ink" for="priority">Priority</label>
            <select
              id="priority"
              class="mt-2 w-full rounded-lg border border-mist bg-white px-4 py-3 text-ink shadow-sm outline-none transition focus:border-forest-600 focus:ring-4 focus:ring-forest-100"
              name="priority"
              value={fieldValue('priority', editingTask?.priority || 'medium')}
            >
              {#each data.choices.priorities as priority}
                <option value={priority.value}>{priority.label}</option>
              {/each}
            </select>
            {#each errorsFor('priority') as error}
              <p class="mt-2 text-sm font-semibold text-clay-800">{error}</p>
            {/each}
          </div>
        </div>

        <div>
          <label class="text-sm font-extrabold text-ink" for="due_date">Due date</label>
          <input
            id="due_date"
            class="mt-2 w-full rounded-lg border border-mist bg-white px-4 py-3 text-ink shadow-sm outline-none transition focus:border-forest-600 focus:ring-4 focus:ring-forest-100"
            name="due_date"
            type="date"
            value={fieldValue('due_date', editingTask?.due_date)}
          />
          {#each errorsFor('due_date') as error}
            <p class="mt-2 text-sm font-semibold text-clay-800">{error}</p>
          {/each}
        </div>

        <div class="flex flex-wrap gap-3 pt-2">
          <button
            class="inline-flex items-center justify-center rounded-lg bg-forest-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-forest-700 focus:outline-none focus:ring-4 focus:ring-forest-100"
            type="submit"
          >
            {modal === 'edit' ? 'Save task' : 'Create task'}
          </button>
          <button
            class="inline-flex items-center justify-center rounded-lg border border-mist bg-white px-5 py-3 text-sm font-bold text-ink transition hover:bg-paper focus:outline-none focus:ring-4 focus:ring-forest-100"
            type="button"
            onclick={closeModal}
          >
            Cancel
          </button>
        </div>
      </form>
    </section>
  </div>
{/if}
