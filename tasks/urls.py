from django.urls import path

from .views import (
    TaskCreateView,
    TaskDeleteView,
    TaskDetailView,
    TaskListView,
    TaskUpdateView,
)
from .api import task_collection_api, task_detail_api

urlpatterns = [
    path('api/tasks/', task_collection_api, name='api-task-list'),
    path('api/tasks/<int:pk>/', task_detail_api, name='api-task-detail'),
    path('', TaskListView.as_view(), name='task-list'),
    path('tasks/new/', TaskCreateView.as_view(), name='task-create'),
    path('tasks/<int:pk>/', TaskDetailView.as_view(), name='task-detail'),
    path('tasks/<int:pk>/edit/', TaskUpdateView.as_view(), name='task-update'),
    path('tasks/<int:pk>/delete/', TaskDeleteView.as_view(), name='task-delete'),
]
