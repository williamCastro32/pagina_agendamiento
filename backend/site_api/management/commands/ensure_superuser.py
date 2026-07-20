"""Create the admin user from environment variables, once, at container start.

`createsuperuser` is interactive, and its `--noinput` mode errors out when the
user already exists — which would crash every restart after the first. Railway
has no reliable way to run a one-off interactive command without the CLI, and on
this machine the CLI is blocked by Smart App Control, so the admin user has to
come from somewhere non-interactive.

Idempotent by design: it is safe to run on every boot.
"""

import os

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = 'Create the superuser named by DJANGO_SUPERUSER_* if it does not exist yet.'

    def handle(self, *args, **options):
        username = os.environ.get('DJANGO_SUPERUSER_USERNAME')
        password = os.environ.get('DJANGO_SUPERUSER_PASSWORD')
        email = os.environ.get('DJANGO_SUPERUSER_EMAIL', '')

        # Not configured is the normal case in development, not an error.
        if not username or not password:
            self.stdout.write('DJANGO_SUPERUSER_USERNAME/PASSWORD unset — skipping.')
            return

        User = get_user_model()
        if User.objects.filter(username=username).exists():
            self.stdout.write(f'Superuser {username!r} already exists — nothing to do.')
            return

        User.objects.create_superuser(username=username, email=email, password=password)
        self.stdout.write(self.style.SUCCESS(f'Created superuser {username!r}.'))
