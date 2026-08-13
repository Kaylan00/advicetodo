import pytest
from django.core.cache import cache
from rest_framework.test import APIClient

from accounts.tests.factories import UserFactory


@pytest.fixture(autouse=True)
def feriados_offline(settings):
    """Nenhum teste sai para a internet: quem exercita o provedor real mocka o HTTP."""
    settings.HOLIDAYS = {
        **settings.HOLIDAYS,
        "PROVIDER": "integrations.holidays.providers.StaticHolidayProvider",
    }


@pytest.fixture(autouse=True)
def cache_limpo():
    cache.clear()
    yield
    cache.clear()


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def user(db):
    return UserFactory()


@pytest.fixture
def other_user(db):
    return UserFactory()


@pytest.fixture
def auth_client(api_client, user):
    api_client.force_authenticate(user)
    return api_client


@pytest.fixture
def client_as():
    """Autentica um cliente novo para qualquer usuario, util nos testes de compartilhamento."""

    def _login(target):
        client = APIClient()
        client.force_authenticate(target)
        return client

    return _login
