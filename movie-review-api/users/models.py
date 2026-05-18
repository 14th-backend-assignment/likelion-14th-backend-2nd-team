from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    email = models.EmailField(unique=True)

    nickname = models.CharField(
        max_length=30,
        unique=True,
    )

    bio = models.TextField(blank=True)

    profile_image = models.ImageField(
        upload_to='profiles/',
        blank=True,
        null=True,
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    REQUIRED_FIELDS = ['email', 'nickname']

    def __str__(self):
        return self.username