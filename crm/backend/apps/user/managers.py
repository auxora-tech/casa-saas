from django.contrib.auth.base_user import BaseUserManager

class ClientManager(BaseUserManager):

    # creates a normal user
    def create_user(self, work_email, first_name, last_name, phone, **extra_fields):

        # client's details validation
        if not first_name:
            raise ValueError("First Name is required")
        if not last_name:
            raise ValueError("Last Name is required")
        if not work_email:
            raise ValueError("Email is required")
        if not phone:
            raise ValueError("Phone Number is required")

        """
        Normalize the email address by lowercasing the domain part of it.
        """
        work_email = self.normalize_email(work_email)
        user = self.model(work_email=work_email, first_name=first_name, last_name=last_name,
                          phone=phone, **extra_fields)
        user.set_unusable_password()  # critical for django compatibility. For magic link auth
        user.save(using=self._db)    # specifies which database to save to
        return user

    # creates admin user for client
    def create_admin_user(self, work_email, first_name, last_name, phone, **extra_fields):
        return self.create_user(work_email=work_email, first_name=first_name, last_name=last_name, phone=phone, **extra_fields)
