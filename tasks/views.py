import json
from urllib.parse import urlencode

from django.db.models import Q
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse, reverse_lazy
from django.views.generic import CreateView, DeleteView, DetailView, ListView, UpdateView

from .forms import TaskForm
from .models import Task


def is_htmx(request):
    return request.headers.get('HX-Request') == 'true'


def htmx_task_changed_response():
    response = HttpResponse(status=204)
    response['HX-Trigger'] = json.dumps(
        {
            'taskListChanged': None,
            'closeModal': None,
        }
    )
    return response


class TaskListView(ListView):
    model = Task
    context_object_name = 'tasks'
    template_name = 'tasks/task_list.html'

    def get_template_names(self):
        if is_htmx(self.request):
            return ['tasks/partials/_task_dashboard.html']
        return [self.template_name]

    def get_current_status(self):
        status = self.request.GET.get('status', '')
        if status in Task.Status.values:
            return status
        return ''

    def get_current_query(self):
        return self.request.GET.get('q', '').strip()

    def get_base_queryset(self):
        queryset = Task.objects.all()
        query = self.get_current_query()
        if query:
            queryset = queryset.filter(
                Q(title__icontains=query) | Q(description__icontains=query)
            )
        return queryset

    def get_queryset(self):
        queryset = self.get_base_queryset()
        status = self.get_current_status()
        if status:
            queryset = queryset.filter(status=status)
        return queryset

    def build_task_list_url(self, status=None):
        params = {}
        query = self.get_current_query()
        if status:
            params['status'] = status
        if query:
            params['q'] = query

        url = reverse('task-list')
        if params:
            return f'{url}?{urlencode(params)}'
        return url

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        current_status = self.get_current_status()
        base_queryset = self.get_base_queryset()
        context['current_status'] = current_status
        context['current_query'] = self.get_current_query()
        context['dashboard_url'] = self.build_task_list_url(current_status)
        context['all_filter_url'] = self.build_task_list_url()
        context['status_filters'] = [
            {
                'value': value,
                'label': label,
                'url': self.build_task_list_url(value),
                'active': current_status == value,
            }
            for value, label in Task.Status.choices
        ]
        context['total_count'] = base_queryset.count()
        context['todo_count'] = base_queryset.filter(status=Task.Status.TODO).count()
        context['in_progress_count'] = base_queryset.filter(
            status=Task.Status.IN_PROGRESS
        ).count()
        context['done_count'] = base_queryset.filter(status=Task.Status.DONE).count()
        return context


class TaskDetailView(DetailView):
    model = Task


class TaskCreateView(CreateView):
    model = Task
    form_class = TaskForm
    success_url = reverse_lazy('task-list')

    def get_template_names(self):
        if is_htmx(self.request):
            return ['tasks/partials/_task_form_modal.html']
        return ['tasks/task_form.html']

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['form_eyebrow'] = 'Create record'
        context['form_title'] = 'New task'
        context['submit_label'] = 'Create task'
        return context

    def form_valid(self, form):
        self.object = form.save()
        if is_htmx(self.request):
            return htmx_task_changed_response()
        return super().form_valid(form)

    def form_invalid(self, form):
        if is_htmx(self.request):
            return render(
                self.request,
                'tasks/partials/_task_form_modal.html',
                self.get_context_data(form=form),
            )
        return super().form_invalid(form)


class TaskUpdateView(UpdateView):
    model = Task
    form_class = TaskForm
    success_url = reverse_lazy('task-list')

    def get_template_names(self):
        if is_htmx(self.request):
            return ['tasks/partials/_task_form_modal.html']
        return ['tasks/task_form.html']

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['form_eyebrow'] = 'Update record'
        context['form_title'] = 'Edit task'
        context['submit_label'] = 'Save task'
        return context

    def form_valid(self, form):
        self.object = form.save()
        if is_htmx(self.request):
            return htmx_task_changed_response()
        return super().form_valid(form)

    def form_invalid(self, form):
        if is_htmx(self.request):
            return render(
                self.request,
                'tasks/partials/_task_form_modal.html',
                self.get_context_data(form=form),
            )
        return super().form_invalid(form)


class TaskDeleteView(DeleteView):
    model = Task
    success_url = reverse_lazy('task-list')

    def get_template_names(self):
        if is_htmx(self.request):
            return ['tasks/partials/_task_confirm_delete_modal.html']
        return ['tasks/task_confirm_delete.html']

    def form_valid(self, form):
        success_url = self.get_success_url()
        self.object.delete()
        if is_htmx(self.request):
            return htmx_task_changed_response()
        return HttpResponseRedirect(success_url)
