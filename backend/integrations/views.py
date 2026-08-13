from django.utils import timezone
from drf_spectacular.utils import OpenApiParameter, extend_schema
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView

from core.exceptions import UpstreamUnavailable

from .holidays.calendar import list_holidays
from .holidays.providers import HolidayProviderError
from .serializers import HolidaySerializer

ANO_MINIMO = 1900
ANO_MAXIMO = 2100


class HolidayListView(APIView):
    """Repassa os feriados nacionais do ano para o front montar o calendario das tarefas."""

    @extend_schema(
        parameters=[OpenApiParameter("year", int, description="Padrao: ano corrente.")],
        responses=HolidaySerializer(many=True),
    )
    def get(self, request):
        year = self._parse_year(request.query_params.get("year"))
        try:
            holidays = list_holidays(year)
        except HolidayProviderError as exc:
            raise UpstreamUnavailable(str(exc)) from exc
        return Response(HolidaySerializer(holidays, many=True).data)

    def _parse_year(self, raw):
        if raw in (None, ""):
            return timezone.localdate().year
        try:
            year = int(raw)
        except (TypeError, ValueError):
            raise ValidationError({"year": ["Informe um ano válido."]}) from None
        if not ANO_MINIMO <= year <= ANO_MAXIMO:
            raise ValidationError({"year": [f"Use um ano entre {ANO_MINIMO} e {ANO_MAXIMO}."]})
        return year
