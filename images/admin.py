from django.contrib import admin

from images.models import Images, Gallery


admin.site.register([Images, Gallery])
