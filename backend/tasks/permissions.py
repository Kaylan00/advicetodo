from rest_framework.permissions import SAFE_METHODS, BasePermission

from .enums import SharePermission

# Excluir e mexer em compartilhamento e privilegio de dono, mesmo para quem tem edicao.
OWNER_ONLY_ACTIONS = {"destroy", "list_shares", "create_share", "revoke_share"}


class TaskAccessPermission(BasePermission):
    """Dono pode tudo; convidado le sempre e escreve so com permissao de edicao."""

    message = "Você não tem permissão para alterar esta tarefa."

    def has_object_permission(self, request, view, obj):
        if obj.owner_id == request.user.id:
            return True
        if getattr(view, "action", None) in OWNER_ONLY_ACTIONS:
            return False
        if request.method in SAFE_METHODS:
            return True
        return obj.shares.filter(user=request.user, permission=SharePermission.EDIT).exists()
