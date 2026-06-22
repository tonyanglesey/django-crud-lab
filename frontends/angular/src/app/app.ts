import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

type Task = {
  id: number;
  title: string;
  description: string;
  status: string;
  status_label: string;
  priority: string;
  priority_label: string;
  due_date: string;
};

type Choice = {
  value: string;
  label: string;
};

type ApiPayload = {
  tasks: Task[];
  counts: {
    total: number;
    todo: number;
    in_progress: number;
    done: number;
  };
  choices: {
    statuses: Choice[];
    priorities: Choice[];
  };
};

type TaskDraft = {
  title: string;
  description: string;
  status: string;
  priority: string;
  due_date: string;
};

@Component({
  selector: 'app-root',
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  tasks: Task[] = [];
  counts = { total: 0, todo: 0, in_progress: 0, done: 0 };
  choices = {
    statuses: [] as Choice[],
    priorities: [] as Choice[],
  };
  filters = { status: '', q: '' };
  draft: TaskDraft = this.blankTask();
  editingId: number | null = null;
  errors: Record<string, string[]> = {};
  loading = true;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadTasks();
  }

  blankTask(): TaskDraft {
    return {
      title: '',
      description: '',
      status: 'todo',
      priority: 'medium',
      due_date: '',
    };
  }

  loadTasks() {
    this.loading = true;
    const params = new URLSearchParams();
    if (this.filters.status) params.set('status', this.filters.status);
    if (this.filters.q) params.set('q', this.filters.q);
    const query = params.toString();

    this.http.get<ApiPayload>(`/api/tasks/${query ? `?${query}` : ''}`).subscribe({
      next: (payload) => {
        this.tasks = payload.tasks;
        this.counts = payload.counts;
        this.choices = payload.choices;
        this.loading = false;
      },
      error: () => {
        this.errors = { __all__: ['Unable to load tasks from Django.'] };
        this.loading = false;
      },
    });
  }

  setStatus(status: string) {
    this.filters.status = status;
    this.loadTasks();
  }

  openCreate() {
    this.editingId = null;
    this.draft = this.blankTask();
    this.errors = {};
  }

  openEdit(task: Task) {
    this.editingId = task.id;
    this.draft = {
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      due_date: task.due_date,
    };
    this.errors = {};
  }

  submitTask() {
    this.errors = {};
    const request = this.editingId
      ? this.http.patch(`/api/tasks/${this.editingId}/`, this.draft)
      : this.http.post('/api/tasks/', this.draft);

    request.subscribe({
      next: () => {
        this.openCreate();
        this.loadTasks();
      },
      error: (response) => {
        this.errors = response.error?.errors || {
          __all__: [response.error?.error || 'Something went wrong.'],
        };
      },
    });
  }

  deleteTask(task: Task) {
    this.http.delete(`/api/tasks/${task.id}/`).subscribe({
      next: () => {
        if (this.editingId === task.id) this.openCreate();
        this.loadTasks();
      },
    });
  }

  statusClass(status: string) {
    return {
      todo: 'tone-muted',
      in_progress: 'tone-gold',
      done: 'tone-forest',
    }[status] || 'tone-muted';
  }

  priorityClass(priority: string) {
    return priority === 'high' ? 'tone-clay' : 'tone-paper';
  }

  fieldErrors(field: string) {
    return this.errors[field] || [];
  }
}
