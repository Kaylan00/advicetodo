from datetime import timedelta

import pytest
from django.db import IntegrityError
from django.utils import timezone

from tasks.models import Category, Task

from .factories import CategoryFactory, TaskFactory

pytestmark = pytest.mark.django_db


def test_concluir_preenche_a_data_de_conclusao():
    task = TaskFactory()

    task.set_completion(True)
    task.refresh_from_db()

    assert task.is_completed
    assert task.completed_at is not None


def test_reabrir_limpa_a_data_de_conclusao():
    task = TaskFactory()
    task.set_completion(True)

    task.set_completion(False)
    task.refresh_from_db()

    assert not task.is_completed
    assert task.completed_at is None


def test_concluir_duas_vezes_nao_mexe_na_data_original():
    task = TaskFactory()
    task.set_completion(True)
    primeira_conclusao = task.completed_at

    task.set_completion(True)

    assert task.completed_at == primeira_conclusao


def test_banco_recusa_conclusao_sem_data(user):
    with pytest.raises(IntegrityError):
        Task.objects.create(owner=user, title="Inconsistente", is_completed=True)


def test_tarefa_vencida_e_apenas_a_que_esta_em_aberto():
    ontem = timezone.localdate() - timedelta(days=1)
    atrasada = TaskFactory(due_date=ontem)
    concluida = TaskFactory(due_date=ontem)
    concluida.set_completion(True)

    assert atrasada.is_overdue
    assert not concluida.is_overdue


def test_categoria_nao_repete_nome_para_o_mesmo_dono(user):
    CategoryFactory(owner=user, name="Trabalho")

    with pytest.raises(IntegrityError):
        Category.objects.create(owner=user, name="trabalho")


def test_categorias_de_donos_diferentes_podem_ter_o_mesmo_nome(user, other_user):
    CategoryFactory(owner=user, name="Trabalho")
    CategoryFactory(owner=other_user, name="Trabalho")

    assert Category.objects.filter(name="Trabalho").count() == 2


def test_apagar_categoria_mantem_a_tarefa():
    categoria = CategoryFactory()
    task = TaskFactory(owner=categoria.owner, category=categoria)

    categoria.delete()
    task.refresh_from_db()

    assert task.category is None
