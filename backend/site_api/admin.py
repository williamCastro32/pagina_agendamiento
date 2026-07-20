from django.contrib import admin

from .models import Booking, SiteContent


@admin.register(SiteContent)
class SiteContentAdmin(admin.ModelAdmin):
    list_display = ('__str__', 'updated_at')

    def has_add_permission(self, request):
        return not SiteContent.objects.exists()

    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('date', 'time', 'name', 'email', 'status', 'price', 'created_at')
    list_filter = ('status', 'date', 'language')
    search_fields = ('name', 'email', 'phone', 'reference')
    readonly_fields = ('reference', 'created_at', 'paid_at')
