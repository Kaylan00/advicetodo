from django.db import connection
from django.http import JsonResponse
from django.views.decorators.http import require_GET


@require_GET
def health(request):
    """Usado pelo healthcheck do compose e pelo probe do App Service."""
    try:
        connection.ensure_connection()
    except Exception:
        return JsonResponse({"status": "degraded", "database": False}, status=503)
    return JsonResponse({"status": "ok", "database": True})
