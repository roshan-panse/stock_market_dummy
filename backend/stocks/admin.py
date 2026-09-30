from django.contrib import admin
from .models import Stock,PriceHistory
# Register your models here.

admin.site.register(Stock)
admin.site.register(PriceHistory)