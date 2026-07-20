from datetime import date as date_cls
from datetime import timedelta

from django.conf import settings
from django.db import IntegrityError, transaction
from django.utils import timezone
from rest_framework import status
from rest_framework.generics import ListAPIView
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Booking, SiteContent
from .serializers import (
    BookingCreateSerializer,
    BookingReadSerializer,
    SiteContentSerializer,
)


class ContentView(APIView):
    """Public read of all site content; admin-only write."""

    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAdminUser()]

    def get(self, request):
        return Response(SiteContentSerializer(SiteContent.load()).data)

    def put(self, request):
        content = SiteContent.load()
        serializer = SiteContentSerializer(content, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class ContentResetView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request):
        return Response(SiteContentSerializer(SiteContent.reset()).data)


class AvailabilityView(APIView):
    """The next N days with their free slots.

    Weekday names are not localised here — the client owns that, and it already
    holds both languages.
    """

    permission_classes = [AllowAny]

    def get(self, request):
        content = SiteContent.load()
        enabled = content.enabled_slots()
        today = date_cls.today()
        horizon = today + timedelta(days=settings.BOOKING_DAYS_AHEAD - 1)

        blocked = set(
            Booking.blocking()
            .filter(date__range=(today, horizon))
            .values_list('date', 'time')
        )

        days = []
        for offset in range(settings.BOOKING_DAYS_AHEAD):
            day = today + timedelta(days=offset)
            slots = [
                {'value': value, 'available': (day, value) not in blocked}
                for value in enabled
            ]
            days.append({
                'date': day.isoformat(),
                # Python's Monday=0 shifted to Sunday=0, matching the client's arrays.
                'weekday': (day.weekday() + 1) % 7,
                'day': day.day,
                'slots': slots,
                'hasAvailability': any(s['available'] for s in slots),
            })

        return Response({
            'days': days,
            'price': content.data.get('videoPrice', ''),
            'duration': content.data.get('videoDuration', ''),
        })


class BookingCreateView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = BookingCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            booking = serializer.save()
        except IntegrityError:
            return Response(
                {'time': ['That slot has just been taken.']},
                status=status.HTTP_409_CONFLICT,
            )
        return Response(BookingReadSerializer(booking).data, status=status.HTTP_201_CREATED)


class BookingPayView(APIView):
    """Mock payment confirmation.

    NOTE: this does not process money and deliberately accepts no card data.
    Wiring a real processor (Stripe et al.) means creating a PaymentIntent
    client-side and confirming it here from the webhook — card details must
    never reach this server.
    """

    permission_classes = [AllowAny]

    def post(self, request, reference):
        with transaction.atomic():
            try:
                booking = Booking.objects.select_for_update().get(reference=reference)
            except Booking.DoesNotExist:
                return Response(status=status.HTTP_404_NOT_FOUND)

            if booking.status == Booking.Status.PAID:
                return Response(BookingReadSerializer(booking).data)

            if booking.status == Booking.Status.CANCELLED:
                return Response(
                    {'detail': 'This booking was cancelled.'},
                    status=status.HTTP_409_CONFLICT,
                )

            clash = (
                Booking.objects.filter(
                    date=booking.date, time=booking.time, status=Booking.Status.PAID
                )
                .exclude(pk=booking.pk)
                .exists()
            )
            if clash:
                return Response(
                    {'detail': 'That slot was booked by someone else.'},
                    status=status.HTTP_409_CONFLICT,
                )

            booking.status = Booking.Status.PAID
            booking.paid_at = timezone.now()
            booking.save(update_fields=['status', 'paid_at'])

        return Response(BookingReadSerializer(booking).data)


class BookingListView(ListAPIView):
    permission_classes = [IsAdminUser]
    serializer_class = BookingReadSerializer
    queryset = Booking.objects.all()
