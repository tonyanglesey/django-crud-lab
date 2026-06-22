import json

from django.db.models import Q
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

from .forms import TaskForm
from .models import Task


def task_to_json(task):
    return {
        'id': task.id,
        'title': task.title,
        'description': task.description,
        'status': task.status,
        'status_label': task.get_status_display(),
        'priority': task.priority,
        'priority_label': task.get_priority_display(),
        'due_date': task.due_date.isoformat() if task.due_date else '',
        'created_at': task.created_at.isoformat(),
        'updated_at': task.updated_at.isoformat(),
    }


def form_errors(form):
    return {
        field: [error['message'] for error in errors]
        for field, errors in form.errors.get_json_data().items()
    }


def parse_json_body(request):
    try:
        return json.loads(request.body or b'{}')
    except json.JSONDecodeError:
        return None


def filtered_tasks(params):
    queryset = Task.objects.all()

    status = params.get('status', '')
    if status in Task.Status.values:
        queryset = queryset.filter(status=status)

    query = params.get('q', '').strip()
    if query:
        queryset = queryset.filter(
            Q(title__icontains=query) | Q(description__icontains=query)
        )

    return queryset


def task_counts(queryset):
    return {
        'total': queryset.count(),
        'todo': queryset.filter(status=Task.Status.TODO).count(),
        'in_progress': queryset.filter(status=Task.Status.IN_PROGRESS).count(),
        'done': queryset.filter(status=Task.Status.DONE).count(),
    }


@csrf_exempt
@require_http_methods(['GET', 'POST'])
def task_collection_api(request):
    if request.method == 'GET':
        queryset = filtered_tasks(request.GET)
        return JsonResponse(
            {
                'tasks': [task_to_json(task) for task in queryset],
                'counts': task_counts(queryset),
                'filters': {
                    'status': request.GET.get('status', ''),
                    'q': request.GET.get('q', ''),
                },
                'choices': {
                    'statuses': [
                        {'value': value, 'label': label}
                        for value, label in Task.Status.choices
                    ],
                    'priorities': [
                        {'value': value, 'label': label}
                        for value, label in Task.Priority.choices
                    ],
                },
            }
        )

    payload = parse_json_body(request)
    if payload is None:
        return JsonResponse({'error': 'Invalid JSON body.'}, status=400)

    form = TaskForm(payload)
    if not form.is_valid():
        return JsonResponse({'errors': form_errors(form)}, status=400)

    task = form.save()
    return JsonResponse({'task': task_to_json(task)}, status=201)


@csrf_exempt
@require_http_methods(['GET', 'PUT', 'PATCH', 'DELETE'])
def task_detail_api(request, pk):
    try:
        task = Task.objects.get(pk=pk)
    except Task.DoesNotExist:
        return JsonResponse({'error': 'Task not found.'}, status=404)

    if request.method == 'GET':
        return JsonResponse({'task': task_to_json(task)})

    if request.method == 'DELETE':
        task.delete()
        return JsonResponse({'deleted': True})

    payload = parse_json_body(request)
    if payload is None:
        return JsonResponse({'error': 'Invalid JSON body.'}, status=400)

    data = {
        'title': task.title,
        'description': task.description,
        'status': task.status,
        'priority': task.priority,
        'due_date': task.due_date.isoformat() if task.due_date else '',
    }
    data.update(payload)

    form = TaskForm(data, instance=task)
    if not form.is_valid():
        return JsonResponse({'errors': form_errors(form)}, status=400)

    task = form.save()
    return JsonResponse({'task': task_to_json(task)})
