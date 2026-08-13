import pytest
from django.urls import reverse

from integrations.holidays.providers import HolidayProviderError

pytestmark = pytest.mark.django_db

URL = reverse("holidays")


class ProvedorQuebrado:
    def list_holidays(self, year):
        raise HolidayProviderError("fora do ar")


def test_endpoint_exige_autenticacao(api_client):
    assert api_client.get(URL).status_code == 401


def test_lista_os_feriados_do_ano(auth_client):
    response = auth_client.get(URL, {"year": 2026})

    assert response.status_code == 200
    assert {"date": "2026-12-25", "name": "Natal"} in response.data


def test_ano_invalido_volta_400(auth_client):
    assert auth_client.get(URL, {"year": "ontem"}).status_code == 400
    assert auth_client.get(URL, {"year": 1500}).status_code == 400


def test_sem_ano_usa_o_ano_corrente(auth_client):
    response = auth_client.get(URL)

    assert response.status_code == 200
    assert len(response.data) == 4


def test_provedor_indisponivel_vira_503(auth_client, settings):
    settings.HOLIDAYS = {
        **settings.HOLIDAYS,
        "PROVIDER": "integrations.tests.test_holidays_api.ProvedorQuebrado",
    }

    assert auth_client.get(URL).status_code == 503
