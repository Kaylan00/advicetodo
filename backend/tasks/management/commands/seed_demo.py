from datetime import timedelta

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.utils import timezone

from tasks.enums import Priority, SharePermission
from tasks.models import Category, Task, TaskShare

User = get_user_model()

SENHA = "advice2026"

CATEGORIAS = [
    ("Auditoria", "#0F766E"),
    ("Operação", "#2563EB"),
    ("Pessoal", "#B45309"),
]

TAREFAS = [
    ("Revisar guias de OPME da semana", "Auditoria", Priority.HIGH, -2),
    ("Fechar relatório de glosas", "Auditoria", Priority.HIGH, 1),
    ("Atualizar tabela de procedimentos", "Auditoria", Priority.MEDIUM, 5),
    ("Conferir integração com a operadora", "Operação", Priority.HIGH, 0),
    ("Preparar rotina de importação", "Operação", Priority.MEDIUM, 3),
    ("Revisar alertas de monitoramento", "Operação", Priority.LOW, 8),
    ("Documentar fluxo de autorização", "Operação", Priority.MEDIUM, 12),
    ("Agendar consulta", "Pessoal", Priority.LOW, 20),
    ("Renovar plano odontológico", "Pessoal", Priority.LOW, None),
    ("Estudar Django REST Framework", "Pessoal", Priority.MEDIUM, None),
    ("Organizar backlog do time", None, Priority.MEDIUM, 2),
    ("Responder e-mails pendentes", None, Priority.LOW, None),
]


class Command(BaseCommand):
    help = "Cria dois usuários com tarefas, categorias e um compartilhamento para explorar a API."

    def handle(self, *args, **options):
        ana = self._usuario("ana@advice.dev", "Ana")
        bruno = self._usuario("bruno@advice.dev", "Bruno")

        categorias = {
            nome: Category.objects.get_or_create(owner=ana, name=nome, defaults={"color": cor})[0]
            for nome, cor in CATEGORIAS
        }

        hoje = timezone.localdate()
        criadas = []
        for titulo, categoria, prioridade, dias in TAREFAS:
            tarefa, _ = Task.objects.get_or_create(
                owner=ana,
                title=titulo,
                defaults={
                    "category": categorias.get(categoria),
                    "priority": prioridade,
                    "due_date": None if dias is None else hoje + timedelta(days=dias),
                },
            )
            criadas.append(tarefa)

        criadas[2].set_completion(True)
        criadas[5].set_completion(True)

        TaskShare.objects.get_or_create(
            task=criadas[0], user=bruno, defaults={"permission": SharePermission.EDIT}
        )
        TaskShare.objects.get_or_create(
            task=criadas[3], user=bruno, defaults={"permission": SharePermission.VIEW}
        )

        self.stdout.write(
            self.style.SUCCESS(
                f"Pronto. Entre como ana@advice.dev ou bruno@advice.dev com a senha {SENHA}."
            )
        )

    def _usuario(self, email, nome):
        user = User.objects.filter(email=email).first()
        if user is None:
            user = User.objects.create_user(email=email, password=SENHA, first_name=nome)
        return user
