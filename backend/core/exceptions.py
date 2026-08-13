from rest_framework import status
from rest_framework.exceptions import APIException, ValidationError
from rest_framework.views import exception_handler as drf_exception_handler


class DomainError(Exception):
    """Regra de negocio violada na camada de servico."""

    def __init__(self, message, field="detail"):
        super().__init__(message)
        self.message = message
        self.field = field


class UpstreamUnavailable(APIException):
    status_code = status.HTTP_503_SERVICE_UNAVAILABLE
    default_detail = "Servico externo indisponivel no momento."
    default_code = "upstream_unavailable"


def api_exception_handler(exc, context):
    """Traduz erros de dominio para 400 e mantem o comportamento padrao do DRF no resto."""
    if isinstance(exc, DomainError):
        exc = ValidationError({exc.field: [exc.message]})
    return drf_exception_handler(exc, context)
