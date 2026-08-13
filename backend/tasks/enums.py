from django.db import models

# Fica fora de models.py porque managers e filters tambem precisam, e importar models
# nesses modulos criaria ciclo.


class Priority(models.TextChoices):
    LOW = "low", "Baixa"
    MEDIUM = "medium", "Média"
    HIGH = "high", "Alta"


class SharePermission(models.TextChoices):
    VIEW = "view", "Somente leitura"
    EDIT = "edit", "Edição"
