from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from . models import User_Model
# Register your models here.

class MyUserAdmin(BaseUserAdmin):
    model = User_Model
    list_display = ('work_email', 'first_name', 'last_name', 'is_staff', 'is_superuser')
    list_filter = ('is_staff', 'is_superuser', 'is_active')
    search_fields = ('work_email', 'first_name', 'last_name')
    ordering = ('work_email',)

    fieldsets = (
        # None as the title, no heading is shown—just the fields.
        (None, {'fields': ('work_email', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name')}),
        ('Permissions', {'fields': ('is_active', 'is_staff',
         'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login',)}),
    )

    add_fieldsets = (
        (None, {
            # CSS classes used to style the form. 'wide' gives a better layout.
            'classes': ('wide',),
            # password1 and password2: Django admin expects these two for password confirmation when creating a user.
            'fields': ('work_email', 'first_name', 'last_name', 'password1', 'password2'),
        }),
    )

admin.site.register(User_Model, MyUserAdmin)
