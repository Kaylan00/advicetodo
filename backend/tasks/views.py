from django.db.models import Count
from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from integrations.holidays.calendar import HolidayCalendar

from .filters import TaskFilter
from .models import Category, Task
from .permissions import TaskAccessPermission
from .serializers import CategorySerializer, TaskSerializer
from .services import toggle_completion


class CategoryViewSet(viewsets.ModelViewSet):
    serializer_class = CategorySerializer
    search_fields = ("name",)
    ordering_fields = ("name", "created_at")

    def get_queryset(self):
        return (
            Category.objects.filter(owner=self.request.user)
            .annotate(tasks_count=Count("tasks"))
            .order_by("name")
        )

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


@extend_schema_view(
    list=extend_schema(description="Tarefas do usuario e as compartilhadas com ele."),
)
class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated, TaskAccessPermission]
    filterset_class = TaskFilter
    search_fields = ("title", "description")
    ordering_fields = ("created_at", "due_date", "title", "priority", "is_completed")

    def get_queryset(self):
        return Task.objects.visible_to(self.request.user).with_related()

    def get_serializer_context(self):
        # Uma instancia por request: o calendario busca cada ano uma unica vez.
        return {**super().get_serializer_context(), "holidays": HolidayCalendar()}

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    @extend_schema(request=None, responses=TaskSerializer)
    @action(detail=True, methods=["post"])
    def toggle(self, request, pk=None):
        """Alterna entre concluida e nao concluida."""
        task = toggle_completion(self.get_object())
        return Response(self.get_serializer(task).data)
