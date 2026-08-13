import pytest
from django.contrib.auth import get_user_model
from django.urls import reverse

from .factories import DEFAULT_PASSWORD, UserFactory

pytestmark = pytest.mark.django_db

User = get_user_model()


def test_registro_cria_usuario_e_ja_devolve_tokens(api_client):
    payload = {"email": "joana@advice.dev", "password": "senha-forte-2026", "first_name": "Joana"}

    response = api_client.post(reverse("register"), payload)

    assert response.status_code == 201
    assert response.data["user"]["email"] == "joana@advice.dev"
    assert response.data["access"]
    assert response.data["refresh"]
    assert User.objects.get(email="joana@advice.dev").check_password("senha-forte-2026")


def test_registro_recusa_email_ja_cadastrado(api_client):
    UserFactory(email="joana@advice.dev")

    response = api_client.post(
        reverse("register"), {"email": "joana@advice.dev", "password": "senha-forte-2026"}
    )

    assert response.status_code == 400
    assert "email" in response.data


def test_registro_recusa_senha_fraca(api_client):
    response = api_client.post(
        reverse("register"), {"email": "joana@advice.dev", "password": "123456"}
    )

    assert response.status_code == 400
    assert "password" in response.data
    assert not User.objects.filter(email="joana@advice.dev").exists()


def test_login_devolve_tokens_e_dados_do_usuario(api_client):
    user = UserFactory()

    response = api_client.post(
        reverse("login"), {"email": user.email, "password": DEFAULT_PASSWORD}
    )

    assert response.status_code == 200
    assert response.data["user"]["id"] == user.id
    assert response.data["access"]


def test_login_com_senha_errada_nao_autentica(api_client):
    user = UserFactory()

    response = api_client.post(reverse("login"), {"email": user.email, "password": "chute"})

    assert response.status_code == 401


def test_me_exige_autenticacao(api_client):
    assert api_client.get(reverse("me")).status_code == 401


def test_me_identifica_o_dono_do_token(api_client):
    user = UserFactory()
    tokens = api_client.post(
        reverse("login"), {"email": user.email, "password": DEFAULT_PASSWORD}
    ).data

    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {tokens['access']}")
    response = api_client.get(reverse("me"))

    assert response.status_code == 200
    assert response.data["email"] == user.email
