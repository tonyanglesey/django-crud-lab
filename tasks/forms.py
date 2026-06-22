from django import forms

from .models import Task


CONTROL_CLASS = (
    'mt-2 w-full rounded-lg border border-mist bg-white px-4 py-3 text-ink '
    'shadow-sm outline-none transition focus:border-forest-600 focus:ring-4 '
    'focus:ring-forest-100'
)


class TaskForm(forms.ModelForm):
    class Meta:
        model = Task
        fields = ['title', 'description', 'status', 'priority', 'due_date']
        widgets = {
            'title': forms.TextInput(attrs={'class': CONTROL_CLASS}),
            'description': forms.Textarea(attrs={'class': CONTROL_CLASS, 'rows': 4}),
            'status': forms.Select(attrs={'class': CONTROL_CLASS}),
            'priority': forms.Select(attrs={'class': CONTROL_CLASS}),
            'due_date': forms.DateInput(attrs={'class': CONTROL_CLASS, 'type': 'date'}),
        }
