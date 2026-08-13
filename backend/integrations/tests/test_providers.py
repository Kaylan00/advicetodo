from datetime import date

import pytest
import requests
import responses

from integrations.holidays.providers import BrasilAPIProvider, HolidayProviderError

BASE_URL = "https://exemplo.test/feriados/v1"


def provider():
    return BrasilAPIProvider(base_url=BASE_URL, timeout=1)


@responses.activate
def test_converte_a_resposta_em_feriados():
    responses.get(
        f"{BASE_URL}/2026",
        json=[
            {"date": "2026-01-01", "name": "Confraternizacao mundial", "type": "national"},
            {"date": "2026-12-25", "name": "Natal", "type": "national"},
        ],
    )

    feriados = provider().list_holidays(2026)

    assert [f.date for f in feriados] == [date(2026, 1, 1), date(2026, 12, 25)]
    assert feriados[1].name == "Natal"


@responses.activate
def test_erro_http_vira_erro_de_dominio():
    responses.get(f"{BASE_URL}/2026", status=500)

    with pytest.raises(HolidayProviderError):
        provider().list_holidays(2026)


@responses.activate
def test_timeout_vira_erro_de_dominio():
    responses.get(f"{BASE_URL}/2026", body=requests.exceptions.ConnectTimeout("estourou"))

    with pytest.raises(HolidayProviderError):
        provider().list_holidays(2026)


@responses.activate
def test_json_quebrado_vira_erro_de_dominio():
    responses.get(f"{BASE_URL}/2026", body="isto nao e json", content_type="application/json")

    with pytest.raises(HolidayProviderError):
        provider().list_holidays(2026)


@responses.activate
def test_payload_fora_do_formato_esperado_vira_erro_de_dominio():
    responses.get(f"{BASE_URL}/2026", json=[{"dia": "2026-01-01"}])

    with pytest.raises(HolidayProviderError):
        provider().list_holidays(2026)
