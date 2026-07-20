from datetime import date, timedelta

from django.contrib.auth.models import User
from django.test import TestCase
from django.utils import timezone

from .default_content import DEFAULT_CONTENT
from .models import PENDING_HOLD, Booking, SiteContent


def first_open_day():
    return SiteContent.load(), date.today()


class ContentApiTests(TestCase):
    def test_content_is_public_and_seeded(self):
        response = self.client.get('/api/content/')
        self.assertEqual(response.status_code, 200)
        # Compared against the seed rather than a literal: this template gets
        # re-skinned per customer, and a hardcoded brand here would turn every
        # rebrand into a failing test.
        self.assertEqual(
            response.json()['data']['brandName'], DEFAULT_CONTENT['brandName']
        )

    def test_anonymous_cannot_write_content(self):
        response = self.client.put(
            '/api/content/', data={'data': {}}, content_type='application/json'
        )
        self.assertIn(response.status_code, (401, 403))

    def test_admin_can_write_content(self):
        User.objects.create_superuser('admin', 'a@example.com', 'pw-for-tests-only')
        token = self.client.post(
            '/api/auth/token/',
            data={'username': 'admin', 'password': 'pw-for-tests-only'},
            content_type='application/json',
        ).json()['access']

        content = SiteContent.load().data
        content['brandName'] = 'NUEVO NOMBRE'
        response = self.client.put(
            '/api/content/',
            data={'data': content},
            content_type='application/json',
            HTTP_AUTHORIZATION=f'Bearer {token}',
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(SiteContent.load().data['brandName'], 'NUEVO NOMBRE')

    def test_load_backfills_keys_added_after_the_row_was_stored(self):
        """An existing install must gain new content keys without a reset."""
        content = SiteContent.load()
        del content.data['professionalName']
        content.save()

        reloaded = SiteContent.load()
        self.assertEqual(
            reloaded.data['professionalName'], DEFAULT_CONTENT['professionalName']
        )
        # Persisted, not just patched in memory.
        self.assertIn('professionalName', SiteContent.objects.get(id=1).data)

    def test_load_backfills_keys_inside_a_language_block(self):
        """Timeline and figures moved into content after sites were live."""
        content = SiteContent.load()
        del content.data['t']['es']['milestones']
        del content.data['t']['en']['stats']
        content.save()

        reloaded = SiteContent.load().data
        self.assertEqual(
            reloaded['t']['es']['milestones'], DEFAULT_CONTENT['t']['es']['milestones']
        )
        self.assertEqual(
            reloaded['t']['en']['stats'], DEFAULT_CONTENT['t']['en']['stats']
        )

    def test_backfill_does_not_refill_a_field_the_owner_cleared(self):
        """Empty is a choice; absent is a missing feature. Only absent refills."""
        content = SiteContent.load()
        content.data['t']['es']['testimonials'] = []
        content.data['t']['es']['heroSubtitle'] = ''
        content.save()

        reloaded = SiteContent.load().data
        self.assertEqual(reloaded['t']['es']['testimonials'], [])
        self.assertEqual(reloaded['t']['es']['heroSubtitle'], '')

    def test_session_label_must_be_a_string(self):
        """It is substituted into ~20 UI strings; a non-string breaks them all."""
        User.objects.create_superuser('admin', 'a@example.com', 'pw-for-tests-only')
        token = self.client.post(
            '/api/auth/token/',
            data={'username': 'admin', 'password': 'pw-for-tests-only'},
            content_type='application/json',
        ).json()['access']

        content = SiteContent.load().data
        del content['t']['es']['sessionLabel']
        response = self.client.put(
            '/api/content/',
            data={'data': content},
            content_type='application/json',
            HTTP_AUTHORIZATION=f'Bearer {token}',
        )
        self.assertEqual(response.status_code, 400)

    def test_stats_must_carry_a_colour(self):
        User.objects.create_superuser('admin', 'a@example.com', 'pw-for-tests-only')
        token = self.client.post(
            '/api/auth/token/',
            data={'username': 'admin', 'password': 'pw-for-tests-only'},
            content_type='application/json',
        ).json()['access']

        content = SiteContent.load().data
        del content['t']['es']['stats'][0]['color']
        response = self.client.put(
            '/api/content/',
            data={'data': content},
            content_type='application/json',
            HTTP_AUTHORIZATION=f'Bearer {token}',
        )
        self.assertEqual(response.status_code, 400)

    def test_backfill_leaves_existing_edits_alone(self):
        content = SiteContent.load()
        content.data['brandName'] = 'EDITADO POR EL DUEÑO'
        content.save()

        self.assertEqual(SiteContent.load().data['brandName'], 'EDITADO POR EL DUEÑO')

    def test_professional_name_must_be_a_string(self):
        User.objects.create_superuser('admin', 'a@example.com', 'pw-for-tests-only')
        token = self.client.post(
            '/api/auth/token/',
            data={'username': 'admin', 'password': 'pw-for-tests-only'},
            content_type='application/json',
        ).json()['access']

        content = SiteContent.load().data
        content['professionalName'] = {'not': 'a string'}
        response = self.client.put(
            '/api/content/',
            data={'data': content},
            content_type='application/json',
            HTTP_AUTHORIZATION=f'Bearer {token}',
        )
        self.assertEqual(response.status_code, 400)

    def test_malformed_content_is_rejected(self):
        User.objects.create_superuser('admin', 'a@example.com', 'pw-for-tests-only')
        token = self.client.post(
            '/api/auth/token/',
            data={'username': 'admin', 'password': 'pw-for-tests-only'},
            content_type='application/json',
        ).json()['access']

        response = self.client.put(
            '/api/content/',
            data={'data': {'slots': [], 't': {}}},
            content_type='application/json',
            HTTP_AUTHORIZATION=f'Bearer {token}',
        )
        self.assertEqual(response.status_code, 400)


class AvailabilityTests(TestCase):
    def test_lists_seven_days_of_enabled_slots(self):
        payload = self.client.get('/api/availability/').json()
        self.assertEqual(len(payload['days']), 7)
        self.assertEqual(len(payload['days'][0]['slots']), 6)
        self.assertTrue(all(s['available'] for s in payload['days'][0]['slots']))

    def test_disabled_slot_disappears(self):
        content = SiteContent.load()
        content.data['slots'][0]['enabled'] = False
        content.save()
        payload = self.client.get('/api/availability/').json()
        self.assertEqual(len(payload['days'][0]['slots']), 5)


class BookingTests(TestCase):
    def payload(self, **overrides):
        base = {
            'date': date.today().isoformat(),
            'time': '9:00',
            'name': 'Test User',
            'phone': '+34600000000',
            'email': 'test@example.com',
            'notes': '',
            'language': 'es',
        }
        base.update(overrides)
        return base

    def post_booking(self, **overrides):
        return self.client.post(
            '/api/bookings/',
            data=self.payload(**overrides),
            content_type='application/json',
        )

    def test_creates_pending_booking_with_server_side_price(self):
        response = self.post_booking()
        self.assertEqual(response.status_code, 201)
        body = response.json()
        self.assertEqual(body['status'], 'pending')
        self.assertEqual(body['price'], '$60 USD')

    def test_client_cannot_dictate_price(self):
        response = self.client.post(
            '/api/bookings/',
            data=self.payload(price='$0 USD'),
            content_type='application/json',
        )
        self.assertEqual(response.json()['price'], '$60 USD')

    def test_rejects_unknown_slot(self):
        response = self.post_booking(time='03:00')
        self.assertEqual(response.status_code, 400)

    def test_rejects_past_date(self):
        response = self.post_booking(date=(date.today() - timedelta(days=1)).isoformat())
        self.assertEqual(response.status_code, 400)

    def test_rejects_date_beyond_horizon(self):
        response = self.post_booking(date=(date.today() + timedelta(days=30)).isoformat())
        self.assertEqual(response.status_code, 400)

    def test_pending_booking_holds_the_slot(self):
        self.post_booking()
        response = self.post_booking(email='other@example.com')
        self.assertEqual(response.status_code, 400)

    def test_expired_pending_hold_releases_the_slot(self):
        first = self.post_booking().json()
        booking = Booking.objects.get(reference=first['reference'])
        Booking.objects.filter(pk=booking.pk).update(
            created_at=timezone.now() - PENDING_HOLD - timedelta(minutes=1)
        )
        response = self.post_booking(email='other@example.com')
        self.assertEqual(response.status_code, 201)

    def test_payment_marks_booking_paid(self):
        reference = self.post_booking().json()['reference']
        response = self.client.post(f'/api/bookings/{reference}/pay/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['status'], 'paid')

    def test_paying_twice_is_idempotent(self):
        reference = self.post_booking().json()['reference']
        self.client.post(f'/api/bookings/{reference}/pay/')
        response = self.client.post(f'/api/bookings/{reference}/pay/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(Booking.objects.filter(status='paid').count(), 1)

    def test_paid_slot_is_no_longer_available(self):
        reference = self.post_booking().json()['reference']
        self.client.post(f'/api/bookings/{reference}/pay/')
        payload = self.client.get('/api/availability/').json()
        slot = next(s for s in payload['days'][0]['slots'] if s['value'] == '9:00')
        self.assertFalse(slot['available'])

    def test_second_payment_for_same_slot_conflicts(self):
        first = self.post_booking().json()['reference']
        Booking.objects.filter(reference=first).update(
            created_at=timezone.now() - PENDING_HOLD - timedelta(minutes=1)
        )
        second = self.post_booking(email='other@example.com').json()['reference']

        self.assertEqual(self.client.post(f'/api/bookings/{first}/pay/').status_code, 200)
        self.assertEqual(self.client.post(f'/api/bookings/{second}/pay/').status_code, 409)

    def test_booking_list_requires_admin(self):
        response = self.client.get('/api/bookings/all/')
        self.assertIn(response.status_code, (401, 403))
