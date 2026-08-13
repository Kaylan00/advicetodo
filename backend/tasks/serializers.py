from drf_spectacular.utils import extend_schema_field
from rest_framework import serializers

from accounts.serializers import UserBriefSerializer

from .enums import SharePermission
from .models import Category, Task, TaskShare


class CategorySerializer(serializers.ModelSerializer):
    tasks_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Category
        fields = ("id", "name", "color", "tasks_count", "created_at")

    def validate_name(self, value):
        name = value.strip()
        duplicates = Category.objects.filter(owner=self.context["request"].user, name__iexact=name)
        if self.instance:
            duplicates = duplicates.exclude(pk=self.instance.pk)
        if duplicates.exists():
            raise serializers.ValidationError("Voce ja tem uma categoria com esse nome.")
        return name


class OwnerCategoryField(serializers.PrimaryKeyRelatedField):
    """Categoria de outro usuario nem aparece como opcao valida."""

    def get_queryset(self):
        return Category.objects.filter(owner=self.context["request"].user)


class TaskShareSerializer(serializers.ModelSerializer):
    user = UserBriefSerializer(read_only=True)

    class Meta:
        model = TaskShare
        fields = ("id", "user", "permission", "created_at")


class TaskShareCreateSerializer(serializers.Serializer):
    email = serializers.EmailField()
    permission = serializers.ChoiceField(
        choices=SharePermission.choices, default=SharePermission.VIEW
    )


class TaskSerializer(serializers.ModelSerializer):
    category = OwnerCategoryField(allow_null=True, required=False)
    category_detail = CategorySerializer(source="category", read_only=True)
    owner = UserBriefSerializer(read_only=True)
    shares = TaskShareSerializer(many=True, read_only=True)
    is_overdue = serializers.BooleanField(read_only=True)
    my_permission = serializers.SerializerMethodField()
    holiday = serializers.SerializerMethodField()

    class Meta:
        model = Task
        fields = (
            "id",
            "title",
            "description",
            "category",
            "category_detail",
            "priority",
            "due_date",
            "is_completed",
            "completed_at",
            "is_overdue",
            "my_permission",
            "holiday",
            "owner",
            "shares",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("completed_at", "created_at", "updated_at")

    @extend_schema_field(serializers.CharField(allow_null=True))
    def get_my_permission(self, task):
        return task.permission_for(self.context["request"].user)

    @extend_schema_field(serializers.CharField(allow_null=True))
    def get_holiday(self, task):
        """Nome do feriado nacional que cai no prazo, quando a integracao externa responde."""
        calendar = self.context.get("holidays")
        return calendar.name_for(task.due_date) if calendar else None

    def create(self, validated_data):
        completed = validated_data.pop("is_completed", False)
        task = super().create(validated_data)
        return task.set_completion(True) if completed else task

    def update(self, instance, validated_data):
        completed = validated_data.pop("is_completed", None)
        task = super().update(instance, validated_data)
        return task if completed is None else task.set_completion(completed)
