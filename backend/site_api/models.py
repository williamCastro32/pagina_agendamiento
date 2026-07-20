import copy
import uuid
from datetime import timedelta

from django.db import models
from django.utils import timezone

from .default_content import DEFAULT_CONTENT

# A slot held by an unpaid booking is released again after this long, so an
# abandoned checkout does not block the calendar forever.
PENDING_HOLD = timedelta(minutes=15)


class SiteContent(models.Model):
    """Singleton row holding every editable piece of site content."""

    id = models.PositiveSmallIntegerField(primary_key=True, default=1, editable=False)
    data = models.JSONField(default=dict)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'site content'
        verbose_name_plural = 'site content'

    def __str__(self):
        return f'Site content (updated {self.updated_at:%Y-%m-%d %H:%M})'

    def save(self, *args, **kwargs):
        self.id = 1  # enforce the singleton
        super().save(*args, **kwargs)

    @classmethod
    def load(cls):
        obj, created = cls.objects.get_or_create(
            id=1, defaults={'data': copy.deepcopy(DEFAULT_CONTENT)}
        )
        if not created and obj.backfill_defaults():
            obj.save()
        return obj

    def backfill_defaults(self):
        """Add content keys the stored row predates. True if anything changed.

        This template ships to many sites, each with its own SiteContent row
        already full of the owner's edits. Without this, adding a key to
        DEFAULT_CONTENT would only reach brand-new installs, and every existing
        one would render undefined until someone hit "reset to original" and
        threw away their content.

        Fills missing *keys* only, never existing values — an owner who blanked
        a field keeps it blank. That is also why this can safely recurse into
        the per-language blocks: a key that is absent entirely means "shipped
        after this row was written", whereas one the owner cleared is still
        present holding '' or [].
        """
        changed = False

        for key, value in DEFAULT_CONTENT.items():
            if key not in self.data:
                self.data[key] = copy.deepcopy(value)
                changed = True

        for lang, defaults in DEFAULT_CONTENT['t'].items():
            block = self.data['t'].setdefault(lang, {})
            for key, value in defaults.items():
                if key not in block:
                    block[key] = copy.deepcopy(value)
                    changed = True

        return changed

    @classmethod
    def reset(cls):
        obj = cls.load()
        obj.data = copy.deepcopy(DEFAULT_CONTENT)
        obj.save()
        return obj

    def enabled_slots(self):
        return [s['value'] for s in self.data.get('slots', []) if s.get('enabled')]


class Booking(models.Model):
    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending payment'
        PAID = 'paid', 'Paid'
        CANCELLED = 'cancelled', 'Cancelled'

    reference = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    date = models.DateField()
    time = models.CharField(max_length=5)

    name = models.CharField(max_length=120)
    phone = models.CharField(max_length=40)
    email = models.EmailField()
    notes = models.TextField(blank=True)
    language = models.CharField(max_length=2, default='es')

    # Snapshotted so a later price change in Admin does not rewrite history.
    price = models.CharField(max_length=40)
    duration = models.CharField(max_length=40)

    status = models.CharField(max_length=10, choices=Status.choices, default=Status.PENDING)
    created_at = models.DateTimeField(auto_now_add=True)
    paid_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ('-created_at',)
        constraints = [
            models.UniqueConstraint(
                fields=['date', 'time'],
                condition=models.Q(status='paid'),
                name='unique_paid_slot',
            )
        ]

    def __str__(self):
        return f'{self.date} {self.time} — {self.name} ({self.status})'

    @property
    def holds_slot(self):
        if self.status == self.Status.PAID:
            return True
        if self.status == self.Status.PENDING:
            return timezone.now() - self.created_at < PENDING_HOLD
        return False

    @classmethod
    def blocking(cls):
        """Bookings that currently make a slot unavailable."""
        cutoff = timezone.now() - PENDING_HOLD
        return cls.objects.filter(
            models.Q(status=cls.Status.PAID)
            | models.Q(status=cls.Status.PENDING, created_at__gte=cutoff)
        )
