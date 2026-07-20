from datetime import date as date_cls
from datetime import timedelta

from django.conf import settings
from rest_framework import serializers

from .default_content import LANGUAGES
from .models import Booking, SiteContent


class SiteContentSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteContent
        fields = ('data', 'updated_at')
        read_only_fields = ('updated_at',)

    def validate_data(self, value):
        if not isinstance(value, dict):
            raise serializers.ValidationError('Content must be an object.')

        # professionalName is substituted into the UI copy wherever {name}
        # appears, so a non-string here would surface as "[object Object]"
        # across half the site.
        for key in ('brandName', 'professionalName'):
            if not isinstance(value.get(key), str):
                raise serializers.ValidationError(f'"{key}" must be a string.')

        slots = value.get('slots')
        if not isinstance(slots, list) or not slots:
            raise serializers.ValidationError('"slots" must be a non-empty list.')
        for slot in slots:
            if not isinstance(slot, dict) or 'value' not in slot or 'enabled' not in slot:
                raise serializers.ValidationError('Each slot needs "value" and "enabled".')

        translations = value.get('t')
        if not isinstance(translations, dict):
            raise serializers.ValidationError('"t" must be an object keyed by language.')
        for lang in LANGUAGES:
            block = translations.get(lang)
            if not isinstance(block, dict):
                raise serializers.ValidationError(f'Missing content for language "{lang}".')
            for key in ('heroKicker', 'heroTitle', 'heroSubtitle', 'sessionLabel'):
                if not isinstance(block.get(key), str):
                    raise serializers.ValidationError(f'"{lang}.{key}" must be a string.')
            for key in ('services', 'testimonials', 'milestones', 'stats', 'heroPhrases'):
                if not isinstance(block.get(key), list):
                    raise serializers.ValidationError(f'"{lang}.{key}" must be a list.')

            # Home renders stats straight into an inline style; a missing colour
            # would blank the figure out rather than fail loudly.
            for stat in block['stats']:
                if not isinstance(stat, dict) or 'color' not in stat:
                    raise serializers.ValidationError(f'Each "{lang}.stats" item needs a "color".')

        return value


class BookingReadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = (
            'reference', 'date', 'time', 'name', 'phone', 'email', 'notes',
            'language', 'price', 'duration', 'status', 'created_at', 'paid_at',
        )
        read_only_fields = fields


class BookingCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = ('date', 'time', 'name', 'phone', 'email', 'notes', 'language')

    def validate_date(self, value):
        today = date_cls.today()
        last = today + timedelta(days=settings.BOOKING_DAYS_AHEAD - 1)
        if value < today:
            raise serializers.ValidationError('That date is in the past.')
        if value > last:
            raise serializers.ValidationError(f'Bookings open only through {last.isoformat()}.')
        return value

    def validate(self, attrs):
        content = SiteContent.load()

        if attrs['time'] not in content.enabled_slots():
            raise serializers.ValidationError({'time': 'That time is not available.'})

        taken = Booking.blocking().filter(date=attrs['date'], time=attrs['time']).exists()
        if taken:
            raise serializers.ValidationError({'time': 'That slot has just been taken.'})

        # Price and duration come from the server, never from the client.
        attrs['price'] = content.data.get('videoPrice', '')
        attrs['duration'] = content.data.get('videoDuration', '')
        return attrs
