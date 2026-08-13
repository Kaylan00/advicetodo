import django_filters as filters

from .enums import Priority
from .models import Task


class TaskFilter(filters.FilterSet):
    is_completed = filters.BooleanFilter()
    category = filters.NumberFilter(field_name="category_id")
    uncategorized = filters.BooleanFilter(field_name="category", lookup_expr="isnull")
    priority = filters.MultipleChoiceFilter(choices=Priority.choices)
    due_after = filters.DateFilter(field_name="due_date", lookup_expr="gte")
    due_before = filters.DateFilter(field_name="due_date", lookup_expr="lte")
    overdue = filters.BooleanFilter(method="filter_overdue")
    scope = filters.ChoiceFilter(
        choices=[("owned", "Minhas"), ("shared", "Compartilhadas comigo")],
        method="filter_scope",
    )

    class Meta:
        model = Task
        fields = ("is_completed", "category", "priority")

    def filter_overdue(self, queryset, name, value):
        if value is None:
            return queryset
        atrasadas = queryset.overdue()
        return atrasadas if value else queryset.exclude(pk__in=atrasadas.values("pk"))

    def filter_scope(self, queryset, name, value):
        user = self.request.user
        return queryset.owned_by(user) if value == "owned" else queryset.shared_with(user)
