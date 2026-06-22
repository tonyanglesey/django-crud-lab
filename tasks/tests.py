from datetime import date
import json

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

    def test_htmx_task_list_returns_dashboard_partial(self):
        Task.objects.create(title='Searchable HTMX task')

        response = self.client.get(
            reverse('task-list'),
            {'q': 'htmx'},
            HTTP_HX_REQUEST='true',
        )

        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'tasks/partials/_task_dashboard.html')
        self.assertContains(response, 'id="task-dashboard"')
        self.assertContains(response, 'Searchable HTMX task')
        self.assertNotContains(response, '<!doctype html>')

    def test_htmx_create_returns_refresh_trigger(self):
        response = self.client.post(
            reverse('task-create'),
            {
                'title': 'Create through HTMX',
                'description': '',
                'status': Task.Status.TODO,
                'priority': Task.Priority.MEDIUM,
                'due_date': '',
            },
            HTTP_HX_REQUEST='true',
        )

        self.assertEqual(response.status_code, 204)
        self.assertEqual(Task.objects.count(), 1)
        trigger = json.loads(response.headers['HX-Trigger'])
        self.assertIn('taskListChanged', trigger)
        self.assertIn('closeModal', trigger)

    def test_htmx_delete_returns_refresh_trigger(self):
        task = Task.objects.create(title='Delete through HTMX')

        response = self.client.post(
            reverse('task-delete', args=[task.pk]),
            HTTP_HX_REQUEST='true',
        )

        self.assertEqual(response.status_code, 204)
        self.assertFalse(Task.objects.filter(pk=task.pk).exists())
        trigger = json.loads(response.headers['HX-Trigger'])
        self.assertIn('taskListChanged', trigger)
        self.assertIn('closeModal', trigger)
