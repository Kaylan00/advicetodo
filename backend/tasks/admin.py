from django.contrib import admin

from .models import Category, Task, TaskShare


class TaskShareInline(admin.TabularInline):
    model = TaskShare
    extra = 0
    autocomplete_fields = ("user",)


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "owner", "color")
    list_filter = ("owner",)
    search_fields = ("name",)


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ("title", "owner", "category", "priority", "is_completed", "due_date")
    list_filter = ("is_completed", "priority", "category")
    search_fields = ("title", "description")
    autocomplete_fields = ("owner", "category")
    inlines = [TaskShareInline]
