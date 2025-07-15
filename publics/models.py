from __future__ import annotations

from django.db import models
from django.utils.text import slugify

from users.models import Client


def save_avatar_to(instance: Public, filename: str):
    safe_title = slugify(value=instance.title)
    return f"publics/{safe_title}/{filename}"


class Public(models.Model):
    owner = models.ForeignKey(
        to=Client,
        on_delete=models.CASCADE,
        related_name="owned_publics",
        verbose_name="владелец паблика"
    )
    avatar = models.ImageField(
        verbose_name="аватар пользователя",
        upload_to=save_avatar_to,
        blank=True,
        null=True,
    )
    title = models.CharField(
        verbose_name="название",
        max_length=200,
        unique=True
    )
    is_private = models.BooleanField(
        verbose_name="приватный паблик",
        default=False
    )
    members = models.ManyToManyField(
        to=Client,
        related_name="member_of_publics",
        verbose_name="участники"
    )
    date_created = models.DateTimeField(
        auto_now_add=True,
        verbose_name="дата создания"
    )

    class Meta:
        ordering = ("id",)
        verbose_name = "паблик"
        verbose_name_plural = "паблики"

    def __str__(self):
        return f"{self.owner} | {self.title} | {self.is_private}"


class PublicInvite(models.Model):
    public = models.ForeignKey(
        to=Public, 
        on_delete=models.CASCADE,
        verbose_name="паблик",
        related_name="public_invites"
    )
    invited_user = models.ForeignKey(
        to=Client, 
        on_delete=models.CASCADE,
        verbose_name="пользователь",
        related_name="invites_received"
    )
    invited_by = models.ForeignKey(
        to=Client, 
        on_delete=models.CASCADE, 
        related_name="invites_sent",
        verbose_name="кем приглашен"
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name="дата приглашения"
    )
    accepted = models.BooleanField(
        null=True,
        default=None,
        verbose_name="принято"
    )

    class Meta:
        ordering = ("created_at",)
        verbose_name = "приглашение в паблик"
        verbose_name_plural = "приглашения в паблики"
        constraints = [
            models.UniqueConstraint(
                fields=["public", "invited_user", "invited_by"],
                name="unique_public_invite",
            )
        ]

    def __str__(self):
        return (f"{self.public.title} | {self.invited_user.username}" 
            f" | {self.created_at} | {self.accepted}")
