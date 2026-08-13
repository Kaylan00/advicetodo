from datetime import date

import pytest
from django.urls import reverse

from tasks.models import Task

from .factories import CategoryFactory, TaskFactory

pytestmark = pytest.mark.django_db

LISTA = reverse("task-list")


def detalhe(task):
    return reverse("task-detail", args=[task.id])


def test_criar_tarefa_usa_o_usuario_autenticado_como_dono(auth_client, user):
    response = auth_client.post(LISTA, {"title": "Revisar guia medica"})

    assert response.status_code == 201
    assert Task.objects.get(id=response.data["id"]).owner == user


def test_criar_tarefa_exige_titulo(auth_client):
    response = auth_client.post(LISTA, {"description": "sem titulo"})

    assert response.status_code == 400
    assert "title" in response.data


def test_listagem_traz_apenas_o_que_o_usuario_pode_ver(auth_client, user, other_user):
    minha = TaskFactory(owner=user)
    TaskFactory(owner=other_user)

    response = auth_client.get(LISTA)

    assert response.status_code == 200
    assert [item["id"] for item in response.data["results"]] == [minha.id]


def test_tarefa_de_outro_usuario_responde_404(auth_client, other_user):
    alheia = TaskFactory(owner=other_user)

    assert auth_client.get(detalhe(alheia)).status_code == 404
    assert auth_client.patch(detalhe(alheia), {"title": "invadindo"}).status_code == 404


def test_editar_tarefa_propria(auth_client, user):
    task = TaskFactory(owner=user, title="Rascunho")

    response = auth_client.patch(detalhe(task), {"title": "Titulo final"})

    assert response.status_code == 200
    task.refresh_from_db()
    assert task.title == "Titulo final"


def test_excluir_tarefa_propria(auth_client, user):
    task = TaskFactory(owner=user)

    assert auth_client.delete(detalhe(task)).status_code == 204
    assert not Task.objects.filter(id=task.id).exists()


def test_toggle_conclui_e_reabre(auth_client, user):
    task = TaskFactory(owner=user)
    url = reverse("task-toggle", args=[task.id])

    concluida = auth_client.post(url)
    assert concluida.status_code == 200
    assert concluida.data["is_completed"] is True
    assert concluida.data["completed_at"]

    reaberta = auth_client.post(url)
    assert reaberta.data["is_completed"] is False
    assert reaberta.data["completed_at"] is None


def test_marcar_conclusao_pelo_patch_tambem_registra_a_data(auth_client, user):
    task = TaskFactory(owner=user)

    response = auth_client.patch(detalhe(task), {"is_completed": True})

    assert response.data["completed_at"]


def test_vincular_categoria_de_outro_usuario_e_rejeitado(auth_client, other_user):
    categoria_alheia = CategoryFactory(owner=other_user)

    response = auth_client.post(LISTA, {"title": "Tarefa", "category": categoria_alheia.id})

    assert response.status_code == 400
    assert "category" in response.data


def test_tarefa_com_prazo_em_feriado_mostra_o_nome_do_feriado(auth_client, user):
    TaskFactory(owner=user, due_date=date(2026, 12, 25))

    response = auth_client.get(LISTA)

    assert response.data["results"][0]["holiday"] == "Natal"


def test_prazo_em_dia_util_nao_traz_feriado(auth_client, user):
    TaskFactory(owner=user, due_date=date(2026, 12, 24))

    response = auth_client.get(LISTA)

    assert response.data["results"][0]["holiday"] is None
