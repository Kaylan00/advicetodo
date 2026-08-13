import factory
from django.contrib.auth import get_user_model

DEFAULT_PASSWORD = "senha-de-teste-2026"


class UserFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = get_user_model()
        skip_postgeneration_save = True

    email = factory.Sequence(lambda n: f"usuario{n}@advice.dev")
    first_name = factory.Sequence(lambda n: f"Usuario {n}")

    @factory.post_generation
    def password(obj, create, extracted, **kwargs):
        obj.set_password(extracted or DEFAULT_PASSWORD)
        if create:
            obj.save(update_fields=["password"])
