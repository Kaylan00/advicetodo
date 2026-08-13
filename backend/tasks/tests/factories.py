import factory

from accounts.tests.factories import UserFactory
from tasks.models import Category, Task, TaskShare


class CategoryFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Category

    owner = factory.SubFactory(UserFactory)
    name = factory.Sequence(lambda n: f"Categoria {n}")


class TaskFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Task

    owner = factory.SubFactory(UserFactory)
    title = factory.Sequence(lambda n: f"Tarefa {n}")


class TaskShareFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = TaskShare

    task = factory.SubFactory(TaskFactory)
    user = factory.SubFactory(UserFactory)
