from django.conf import settings
from django.core.validators import RegexValidator
from django.db import models
from django.db.models import Q
from django.db.models.functions import Lower
from django.utils import timezone

from core.models import TimeStampedModel

from .enums import Priority, SharePermission
from .managers import TaskQuerySet

hex_color = RegexValidator(r"^#[0-9A-Fa-f]{6}$", "Use uma cor no formato #RRGGBB.")


class Category(TimeStampedModel):
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL, related_name="categories", on_delete=models.CASCADE
    )
    name = models.CharField("nome", max_length=60)
    color = models.CharField("cor", max_length=7, default="#2563EB", validators=[hex_color])

    class Meta:
        verbose_name = "categoria"
        verbose_name_plural = "categorias"
        ordering = ("name",)
        constraints = [
            models.UniqueConstraint(
                Lower("name"), "owner", name="categoria_com_nome_unico_por_usuario"
            )
        ]

    def __str__(self):
        return self.name


class Task(TimeStampedModel):
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL, related_name="tasks", on_delete=models.CASCADE
    )
    title = models.CharField("titulo", max_length=120)
    description = models.TextField("descricao", blank=True)
    category = models.ForeignKey(
        Category, related_name="tasks", on_delete=models.SET_NULL, null=True, blank=True
    )
    priority = models.CharField(
        "prioridade", max_length=6, choices=Priority.choices, default=Priority.MEDIUM
    )
    due_date = models.DateField("prazo", null=True, blank=True)
    is_completed = models.BooleanField("concluida", default=False)
    completed_at = models.DateTimeField("concluida em", null=True, blank=True)

    objects = TaskQuerySet.as_manager()

    class Meta:
        verbose_name = "tarefa"
        verbose_name_plural = "tarefas"
        ordering = ("-created_at", "-id")
        indexes = [
            models.Index(fields=["owner", "is_completed"]),
            models.Index(fields=["due_date"]),
        ]
        constraints = [
            # completed_at so existe quando a tarefa esta concluida, e vice-versa.
            models.CheckConstraint(
                condition=Q(is_completed=True, completed_at__isnull=False)
                | Q(is_completed=False, completed_at__isnull=True),
                name="conclusao_com_data_coerente",
            )
        ]

    def __str__(self):
        return self.title

    @property
    def is_overdue(self):
        return bool(
            self.due_date and not self.is_completed and self.due_date < timezone.localdate()
        )

    def set_completion(self, completed):
        """Unico ponto que muda o estado de conclusao, para completed_at nunca divergir."""
        if completed == self.is_completed:
            return self
        self.is_completed = completed
        self.completed_at = timezone.now() if completed else None
        if self.pk:
            self.save(update_fields=["is_completed", "completed_at", "updated_at"])
        return self

    def permission_for(self, user):
        if self.owner_id == user.id:
            return "owner"
        share = next((s for s in self.shares.all() if s.user_id == user.id), None)
        return share.permission if share else None


class TaskShare(models.Model):
    task = models.ForeignKey(Task, related_name="shares", on_delete=models.CASCADE)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, related_name="shared_tasks", on_delete=models.CASCADE
    )
    permission = models.CharField(
        "permissao", max_length=4, choices=SharePermission.choices, default=SharePermission.VIEW
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "compartilhamento"
        verbose_name_plural = "compartilhamentos"
        ordering = ("-created_at",)
        constraints = [
            models.UniqueConstraint(fields=["task", "user"], name="um_compartilhamento_por_usuario")
        ]

    def __str__(self):
        return f"{self.task} -> {self.user}"
