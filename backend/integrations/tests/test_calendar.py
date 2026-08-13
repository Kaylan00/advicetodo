from datetime import date

from integrations.holidays.calendar import HolidayCalendar, list_holidays
from integrations.holidays.providers import Holiday, HolidayProviderError


class ProvedorContado:
    chamadas = 0

    def list_holidays(self, year):
        type(self).chamadas += 1
        return [Holiday(date=date(year, 12, 25), name="Natal")]


class ProvedorQuebrado:
    def list_holidays(self, year):
        raise HolidayProviderError("fora do ar")


def usar(settings, provider_path):
    settings.HOLIDAYS = {**settings.HOLIDAYS, "PROVIDER": provider_path}


def test_calendario_encontra_o_feriado_do_dia(settings):
    usar(settings, "integrations.tests.test_calendar.ProvedorContado")

    calendario = HolidayCalendar()

    assert calendario.name_for(date(2026, 12, 25)) == "Natal"
    assert calendario.name_for(date(2026, 12, 26)) is None
    assert calendario.name_for(None) is None


def test_consulta_o_provedor_uma_vez_por_ano(settings):
    usar(settings, "integrations.tests.test_calendar.ProvedorContado")
    ProvedorContado.chamadas = 0
    calendario = HolidayCalendar()

    calendario.name_for(date(2026, 12, 25))
    calendario.name_for(date(2026, 3, 10))
    calendario.name_for(date(2027, 12, 25))

    assert ProvedorContado.chamadas == 2


def test_provedor_fora_do_ar_nao_derruba_o_calendario(settings):
    usar(settings, "integrations.tests.test_calendar.ProvedorQuebrado")

    assert HolidayCalendar().name_for(date(2026, 12, 25)) is None


def test_resultado_fica_em_cache_entre_calendarios(settings):
    usar(settings, "integrations.tests.test_calendar.ProvedorContado")
    ProvedorContado.chamadas = 0

    list_holidays(2026)
    HolidayCalendar().name_for(date(2026, 12, 25))

    assert ProvedorContado.chamadas == 1
