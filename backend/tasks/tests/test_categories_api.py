import pytest
from django.urls import reverse

from tasks.models import Category

from .factories import CategoryFactory, TaskFactory

pytestmark = pytest.mark.django_db

LISTA = reverse("category-list")


def test_criar_categoria(auth_client, user):
    response = auth_client.post(LISTA, {"name": "Auditoria", "color": "#10B981"})

    assert response.status_code == 201
    assert Category.objects.get(id=response.data["id"]).owner == user


def test_nome_repetido_para_o_mesmo_usuario_volta_erro_tratado(auth_client, user):
    CategoryFactory(owner=user, name="Auditoria")

    response = auth_client.post(LISTA, {"name": "auditoria"})

    assert response.status_code == 400
    assert "name" in response.data


def test_cor_precisa_ser_hexadecimal(auth_client):
    response = auth_client.post(LISTA, {"name": "Auditoria", "color": "verde"})

    assert response.status_code == 400
    assert "color" in response.data


def test_listagem_mostra_so_as_categorias_do_usuario(auth_client, user, other_user):
    minha = CategoryFactory(owner=user)
    CategoryFactory(owner=other_user)

    response = auth_client.get(LISTA)

    assert [item["id"] for item in response.data["results"]] == [minha.id]


def test_listagem_conta_as_tarefas_da_categoria(auth_client, user):
    categoria = CategoryFactory(owner=user)
    TaskFactory.create_batch(3, owner=user, category=categoria)

    response = auth_client.get(LISTA)

    assert response.data["results"][0]["tasks_count"] == 3


def test_renomear_categoria(auth_client, user):
    categoria = CategoryFactory(owner=user, name="Antigo")

    response = auth_client.patch(reverse("category-detail", args=[categoria.id]), {"name": "Novo"})

    assert response.status_code == 200
    categoria.refresh_from_db()
    assert categoria.name == "Novo"


def test_excluir_categoria_nao_derruba_as_tarefas(auth_client, user):
    categoria = CategoryFactory(owner=user)
    task = TaskFactory(owner=user, category=categoria)

    assert auth_client.delete(reverse("category-detail", args=[categoria.id])).status_code == 204
    task.refresh_from_db()
    assert task.category is None
