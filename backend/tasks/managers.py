from django.db import models
from django.db.models import Q
from django.utils import timezone


class TaskQuerySet(models.QuerySet):
    def visible_to(self, user):
        """Tarefas do proprio usuario mais as que foram compartilhadas com ele."""
        return self.filter(Q(owner=user) | Q(shares__user=user)).distinct()

    def owned_by(self, user):
        return self.filter(owner=user)

    def shared_with(self, user):
        return self.filter(shares__user=user)

    def overdue(self, today=None):
        return self.filter(is_completed=False, due_date__lt=today or timezone.localdate())

    def with_related(self):
        return self.select_related("owner", "category").prefetch_related("shares__user")
