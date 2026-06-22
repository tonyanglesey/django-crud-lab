from django.urls import reverse_lazy
from django.views.generic import CreateView, DeleteView, DetailView, ListView, UpdateView

from .forms import TaskForm
from .models import Task


class TaskListView(ListView):
    model = Task
    context_object_name = 'tasks'

    def get_queryset(self):
        queryset = super().get_queryset()
        status = self.request.GET.get('status')
        if status in Task.Status.values:
            queryset = queryset.filter(status=status)
        return queryset

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['status_choices'] = Task.Status.choices
        context['current_status'] = self.request.GET.get('status', '')
        context['total_count'] = Task.objects.count()
        context['todo_count'] = Task.objects.filter(status=Task.Status.TODO).count()
        context['in_progress_count'] = Task.objects.filter(
            status=Task.Status.IN_PROGRESS
        ).count()
        context['done_count'] = Task.objects.filter(status=Task.Status.DONE).count()
        return context


class TaskDetailView(DetailView):
    model = Task


class TaskCreateView(CreateView):
    model = Task
    form_class = TaskForm
    success_url = reverse_lazy('task-list')


class TaskUpdateView(UpdateView):
    model = Task
    form_class = TaskForm
    success_url = reverse_lazy('task-list')


class TaskDeleteView(DeleteView):
    model = Task
    success_url = reverse_lazy('task-list')
