from dataclasses import dataclass
from datetime import date

import requests
from django.conf import settings


class HolidayProviderError(Exception):
    """Qualquer falha ao falar com o provedor externo, ja traduzida para o dominio."""


@dataclass(frozen=True)
class Holiday:
    date: date
    name: str


class BrasilAPIProvider:
    """Feriados nacionais da BrasilAPI (https://brasilapi.com.br/docs#tag/Feriados-Nacionais)."""

    def __init__(self, base_url=None, timeout=None, session=None):
        self.base_url = (base_url or settings.HOLIDAYS["BASE_URL"]).rstrip("/")
        self.timeout = timeout or settings.HOLIDAYS["TIMEOUT"]
        self.session = session or requests.Session()

    def list_holidays(self, year):
        try:
            response = self.session.get(f"{self.base_url}/{year}", timeout=self.timeout)
            response.raise_for_status()
            payload = response.json()
        except requests.RequestException as exc:
            raise HolidayProviderError(f"Falha ao consultar os feriados de {year}.") from exc
        except ValueError as exc:
            raise HolidayProviderError("O provedor de feriados devolveu um JSON invalido.") from exc

        try:
            return [
                Holiday(date=date.fromisoformat(item["date"]), name=item["name"])
                for item in payload
            ]
        except (KeyError, TypeError, ValueError) as exc:
            raise HolidayProviderError("Formato inesperado na resposta de feriados.") from exc


class StaticHolidayProvider:
    """Usado nos testes e como plano B quando nao se quer depender da rede."""

    FIXED = {
        1: (1, "Confraternizacao mundial"),
        4: (21, "Tiradentes"),
        9: (7, "Independencia do Brasil"),
        12: (25, "Natal"),
    }

    def list_holidays(self, year):
        return [
            Holiday(date=date(year, month, day), name=name)
            for month, (day, name) in self.FIXED.items()
        ]
