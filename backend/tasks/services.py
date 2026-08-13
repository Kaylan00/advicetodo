from django.contrib.auth import get_user_model

from core.exceptions import DomainError

from .models import TaskShare

User = get_user_model()


def share_task(task, email, permission):
    """Compartilha com quem ja tem conta. Repetir o compartilhamento troca a permissao."""
    target = User.objects.filter(email__iexact=email.strip()).first()
    if target is None:
        raise DomainError("Nenhum usuario cadastrado com esse e-mail.", field="email")
    if target.id == task.owner_id:
        raise DomainError("A tarefa ja e sua.", field="email")

    share, created = TaskShare.objects.update_or_create(
        task=task, user=target, defaults={"permission": permission}
    )
    return share, created


def revoke_share(task, user_id):
    deleted, _ = TaskShare.objects.filter(task=task, user_id=user_id).delete()
    if not deleted:
        raise DomainError("Essa tarefa nao esta compartilhada com o usuario informado.")


def toggle_completion(task):
    return task.set_completion(not task.is_completed)
