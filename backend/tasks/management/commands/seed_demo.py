from datetime import date, timedelta

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
    (
        "Revisar guias de OPME da semana",
        "Conferir os pareceres pendentes",
        "Auditoria",
        Priority.HIGH,
        -2,
    ),
    ("Fechar relatório de glosas", "Consolidar os números do mês", "Auditoria", Priority.HIGH, 1),
    (
        "Atualizar tabela de procedimentos",
        "Aplicar a nova versão do rol",
        "Auditoria",
        Priority.MEDIUM,
        5,
    ),
    (
        "Conferir integração com a operadora",
        "Validar o retorno das guias",
        "Operação",
        Priority.HIGH,
        0,
    ),
    ("Preparar rotina de importação", "Mapear o layout do arquivo", "Operação", Priority.MEDIUM, 3),
    (
        "Revisar alertas de monitoramento",
        "Ajustar os limites de disparo",
        "Operação",
        Priority.LOW,
        8,
    ),
    (
        "Documentar fluxo de autorização",
        "Desenhar o passo a passo no wiki",
        "Operação",
        Priority.MEDIUM,
        12,
    ),
    ("Agendar consulta", "Levar os exames anteriores", "Pessoal", Priority.LOW, 20),
    ("Renovar plano odontológico", "Comparar as duas propostas", "Pessoal", Priority.LOW, None),
    (
        "Estudar Django REST Framework",
        "Terminar o capítulo de permissões",
        "Pessoal",
        Priority.MEDIUM,
        None,
    ),
    ("Organizar backlog do time", "Repriorizar antes da próxima sprint", None, Priority.MEDIUM, 2),
    ("Responder e-mails pendentes", "Caixa de entrada da semana", None, Priority.LOW, None),
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
        for titulo, descricao, categoria, prioridade, dias in TAREFAS:
            tarefa, _ = Task.objects.get_or_create(
                owner=ana,
                title=titulo,
                defaults={
                    "description": descricao,
                    "category": categorias.get(categoria),
                    "priority": prioridade,
                    "due_date": None if dias is None else hoje + timedelta(days=dias),
                },
            )
            criadas.append(tarefa)

        # Prazo caindo em feriado nacional, para a integração externa aparecer na listagem.
        sete_de_setembro = date(hoje.year + (0 if (hoje.month, hoje.day) <= (9, 7) else 1), 9, 7)
        Task.objects.get_or_create(
            owner=ana,
            title="Comprar passagens",
            defaults={
                "description": "Viagem para o evento em São Paulo",
                "category": categorias["Pessoal"],
                "priority": Priority.HIGH,
                "due_date": sete_de_setembro,
            },
        )

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
