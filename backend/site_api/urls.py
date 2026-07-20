from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from . import views

urlpatterns = [
    path('content/', views.ContentView.as_view(), name='content'),
    path('content/reset/', views.ContentResetView.as_view(), name='content-reset'),
    path('availability/', views.AvailabilityView.as_view(), name='availability'),
    path('bookings/', views.BookingCreateView.as_view(), name='booking-create'),
    path('bookings/all/', views.BookingListView.as_view(), name='booking-list'),
    path('bookings/<uuid:reference>/pay/', views.BookingPayView.as_view(), name='booking-pay'),
    path('auth/token/', TokenObtainPairView.as_view(), name='token-obtain'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
]
