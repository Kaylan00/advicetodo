import pytest
from django.urls import reverse

from tasks.enums import SharePermission
from tasks.models import TaskShare

from .factories import TaskFactory, TaskShareFactory

pytestmark = pytest.mark.django_db


def shares_url(task):
    return reverse("task-list-shares", args=[task.id])


def revoke_url(task, target):
    return reverse("task-revoke-share", args=[task.id, target.id])


def detalhe(task):
    return reverse("task-detail", args=[task.id])


def test_dono_compartilha_pelo_email(auth_client, user, other_user):
    task = TaskFactory(owner=user)

    response = auth_client.post(shares_url(task), {"email": other_user.email})

    assert response.status_code == 201
    assert response.data["permission"] == SharePermission.VIEW
    assert TaskShare.objects.filter(task=task, user=other_user).exists()


def test_email_sem_cadastro_volta_erro_de_validacao(auth_client, user):
    task = TaskFactory(owner=user)

    response = auth_client.post(shares_url(task), {"email": "ninguem@advice.dev"})

    assert response.status_code == 400
    assert "email" in response.data


def test_nao_da_para_compartilhar_consigo_mesmo(auth_client, user):
    task = TaskFactory(owner=user)

    response = auth_client.post(shares_url(task), {"email": user.email})

    assert response.status_code == 400


def test_compartilhar_de_novo_apenas_atualiza_a_permissao(auth_client, user, other_user):
    task = TaskFactory(owner=user)
    auth_client.post(shares_url(task), {"email": other_user.email})

    response = auth_client.post(
        shares_url(task), {"email": other_user.email, "permission": SharePermission.EDIT}
    )

    assert response.status_code == 200
    assert TaskShare.objects.get(task=task, user=other_user).permission == SharePermission.EDIT


def test_convidado_enxerga_a_tarefa_compartilhada(client_as, user, other_user):
    task = TaskFactory(owner=user)
    TaskShareFactory(task=task, user=other_user)

    response = client_as(other_user).get(reverse("task-list"))

    assert [item["id"] for item in response.data["results"]] == [task.id]
    assert response.data["results"][0]["my_permission"] == SharePermission.VIEW


def test_convidado_somente_leitura_nao_edita(client_as, user, other_user):
    task = TaskFactory(owner=user)
    TaskShareFactory(task=task, user=other_user, permission=SharePermission.VIEW)

    response = client_as(other_user).patch(detalhe(task), {"title": "mexendo"})

    assert response.status_code == 403


def test_convidado_com_edicao_altera_a_tarefa(client_as, user, other_user):
    task = TaskFactory(owner=user)
    TaskShareFactory(task=task, user=other_user, permission=SharePermission.EDIT)

    response = client_as(other_user).patch(detalhe(task), {"title": "ajustado a quatro maos"})

    assert response.status_code == 200
    task.refresh_from_db()
    assert task.title == "ajustado a quatro maos"


def test_convidado_com_edicao_ainda_nao_exclui(client_as, user, other_user):
    task = TaskFactory(owner=user)
    TaskShareFactory(task=task, user=other_user, permission=SharePermission.EDIT)

    assert client_as(other_user).delete(detalhe(task)).status_code == 403


def test_convidado_nao_repassa_a_tarefa(client_as, user, other_user):
    task = TaskFactory(owner=user)
    TaskShareFactory(task=task, user=other_user, permission=SharePermission.EDIT)

    response = client_as(other_user).post(shares_url(task), {"email": "terceiro@advice.dev"})

    assert response.status_code == 403


def test_dono_revoga_o_acesso(auth_client, client_as, user, other_user):
    task = TaskFactory(owner=user)
    TaskShareFactory(task=task, user=other_user)

    assert auth_client.delete(revoke_url(task, other_user)).status_code == 204
    assert client_as(other_user).get(detalhe(task)).status_code == 404


def test_revogar_quem_nao_tem_acesso_volta_400(auth_client, user, other_user):
    task = TaskFactory(owner=user)

    assert auth_client.delete(revoke_url(task, other_user)).status_code == 400


def test_dono_lista_com_quem_dividiu_a_tarefa(auth_client, user, other_user):
    task = TaskFactory(owner=user)
    TaskShareFactory(task=task, user=other_user)

    response = auth_client.get(shares_url(task))

    assert response.status_code == 200
    assert response.data[0]["user"]["email"] == other_user.email
