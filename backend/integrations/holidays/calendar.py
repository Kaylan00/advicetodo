import logging

from django.conf import settings
from django.core.cache import cache
from django.utils.module_loading import import_string

from .providers import HolidayProviderError

logger = logging.getLogger(__name__)


def get_provider():
    """Vem das settings: trocar a fonte de feriados nao toca no resto do codigo."""
    return import_string(settings.HOLIDAYS["PROVIDER"])()


def list_holidays(year):
    cache_key = f"holidays:{year}"
    holidays = cache.get(cache_key)
    if holidays is None:
        holidays = get_provider().list_holidays(year)
        cache.set(cache_key, holidays, settings.HOLIDAYS["CACHE_SECONDS"])
    return holidays


class HolidayCalendar:
    """
    Consulta um ano por vez, sob demanda, e guarda o resultado durante o request.

    Se a API externa cair, o campo volta nulo e a listagem de tarefas continua de pe:
    feriado e informacao acessoria, nao pode derrubar o recurso principal.
    """

    def __init__(self):
        self._years = {}

    def name_for(self, day):
        if day is None:
            return None
        if day.year not in self._years:
            self._years[day.year] = self._load(day.year)
        return self._years[day.year].get(day)

    def _load(self, year):
        try:
            return {holiday.date: holiday.name for holiday in list_holidays(year)}
        except HolidayProviderError:
            logger.warning("Feriados de %s indisponiveis, seguindo sem o dado.", year)
            return {}
