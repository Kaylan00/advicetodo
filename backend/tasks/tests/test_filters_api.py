from datetime import timedelta

import pytest
from django.urls import reverse
from django.utils import timezone

from tasks.enums import Priority

from .factories import CategoryFactory, TaskFactory, TaskShareFactory

pytestmark = pytest.mark.django_db

LISTA = reverse("task-list")


def ids(response):
    return {item["id"] for item in response.data["results"]}


def test_filtra_por_conclusao(auth_client, user):
    aberta = TaskFactory(owner=user)
    concluida = TaskFactory(owner=user)
    concluida.set_completion(True)

    assert ids(auth_client.get(LISTA, {"is_completed": "false"})) == {aberta.id}
    assert ids(auth_client.get(LISTA, {"is_completed": "true"})) == {concluida.id}


def test_filtra_por_categoria(auth_client, user):
    categoria = CategoryFactory(owner=user)
    da_categoria = TaskFactory(owner=user, category=categoria)
    TaskFactory(owner=user)

    assert ids(auth_client.get(LISTA, {"category": categoria.id})) == {da_categoria.id}


def test_filtra_as_sem_categoria(auth_client, user):
    solta = TaskFactory(owner=user)
    TaskFactory(owner=user, category=CategoryFactory(owner=user))

    assert ids(auth_client.get(LISTA, {"uncategorized": "true"})) == {solta.id}


def test_filtra_por_prioridade(auth_client, user):
    alta = TaskFactory(owner=user, priority=Priority.HIGH)
    TaskFactory(owner=user, priority=Priority.LOW)

    assert ids(auth_client.get(LISTA, {"priority": Priority.HIGH})) == {alta.id}


def test_filtra_por_intervalo_de_prazo(auth_client, user):
    hoje = timezone.localdate()
    dentro = TaskFactory(owner=user, due_date=hoje + timedelta(days=2))
    TaskFactory(owner=user, due_date=hoje + timedelta(days=30))

    response = auth_client.get(
        LISTA, {"due_after": hoje.isoformat(), "due_before": (hoje + timedelta(days=7)).isoformat()}
    )

    assert ids(response) == {dentro.id}


def test_filtra_atrasadas(auth_client, user):
    ontem = timezone.localdate() - timedelta(days=1)
    atrasada = TaskFactory(owner=user, due_date=ontem)
    no_prazo = TaskFactory(owner=user, due_date=timezone.localdate() + timedelta(days=1))

    assert ids(auth_client.get(LISTA, {"overdue": "true"})) == {atrasada.id}
    assert ids(auth_client.get(LISTA, {"overdue": "false"})) == {no_prazo.id}


def test_separa_minhas_tarefas_das_compartilhadas(auth_client, user, other_user):
    minha = TaskFactory(owner=user)
    recebida = TaskFactory(owner=other_user)
    TaskShareFactory(task=recebida, user=user)

    assert ids(auth_client.get(LISTA, {"scope": "owned"})) == {minha.id}
    assert ids(auth_client.get(LISTA, {"scope": "shared"})) == {recebida.id}


def test_busca_por_titulo_e_descricao(auth_client, user):
    encontrada = TaskFactory(owner=user, title="Revisar guia de OPME")
    TaskFactory(owner=user, title="Reuniao semanal")

    assert ids(auth_client.get(LISTA, {"search": "opme"})) == {encontrada.id}


def test_ordena_por_prazo(auth_client, user):
    hoje = timezone.localdate()
    depois = TaskFactory(owner=user, due_date=hoje + timedelta(days=5))
    antes = TaskFactory(owner=user, due_date=hoje + timedelta(days=1))

    response = auth_client.get(LISTA, {"ordering": "due_date"})

    assert [item["id"] for item in response.data["results"]] == [antes.id, depois.id]


def test_pagina_com_dez_itens_por_padrao(auth_client, user):
    TaskFactory.create_batch(12, owner=user)

    response = auth_client.get(LISTA)

    assert response.data["count"] == 12
    assert response.data["pages"] == 2
    assert len(response.data["results"]) == 10
    assert response.data["next"]


def test_tamanho_de_pagina_pode_ser_ajustado(auth_client, user):
    TaskFactory.create_batch(12, owner=user)

    response = auth_client.get(LISTA, {"page_size": 5, "page": 3})

    assert response.data["page"] == 3
    assert response.data["pages"] == 3
    assert len(response.data["results"]) == 2
    assert response.data["next"] is None


def test_tamanho_de_pagina_tem_teto(auth_client, user):
    TaskFactory.create_batch(3, owner=user)

    response = auth_client.get(LISTA, {"page_size": 5000})

    assert response.data["page_size"] == 100
