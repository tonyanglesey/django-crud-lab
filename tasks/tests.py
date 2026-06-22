from datetime import date

from django.test import TestCase
from django.urls import reverse

from .models import Task


class TaskCrudTests(TestCase):
    def test_task_list_page_loads(self):
        response = self.client.get(reverse('task-list'))

        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Tasks')

    def test_task_can_be_created(self):
        response = self.client.post(
            reverse('task-create'),
            {
                'title': 'Prep Django interview notes',
                'description': 'Models, views, forms, templates, URLs',
                'status': Task.Status.TODO,
                'priority': Task.Priority.HIGH,
                'due_date': date.today().isoformat(),
            },
        )

        self.assertRedirects(response, reverse('task-list'))
        self.assertEqual(Task.objects.count(), 1)
        self.assertEqual(Task.objects.first().title, 'Prep Django interview notes')

    def test_task_can_be_updated(self):
        task = Task.objects.create(title='Read Django docs')

        response = self.client.post(
            reverse('task-update', args=[task.pk]),
            {
                'title': 'Read Django generic view docs',
                'description': '',
                'status': Task.Status.IN_PROGRESS,
                'priority': Task.Priority.MEDIUM,
                'due_date': '',
            },
        )

        self.assertRedirects(response, reverse('task-list'))
        task.refresh_from_db()
        self.assertEqual(task.status, Task.Status.IN_PROGRESS)
        self.assertEqual(task.title, 'Read Django generic view docs')

    def test_task_can_be_deleted(self):
        task = Task.objects.create(title='Delete me')

        response = self.client.post(reverse('task-delete', args=[task.pk]))

        self.assertRedirects(response, reverse('task-list'))
        self.assertFalse(Task.objects.filter(pk=task.pk).exists())
