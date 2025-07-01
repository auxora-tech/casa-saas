from django.template.loader import render_to_string
from django.conf import settings
from django.core.mail import send_mail

def get_client_ip(request):
    """Get real client IP address"""
    # request.META is a dictionary-like object in Django that contains all the HTTP headers.
    # HTTP_X_FORWARDED_FOR is a common proxy header that holds the original IP address of the client
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        return x_forwarded_for.split(',')[0].strip()
    return request.META.get('REMOTE_ADDR', '127.0.0.1')


def send_magic_link_email(magic_token, action):
    """Send magic link email with beautiful templates"""
    try:
        link_url = magic_token.get_login_url()

        # Email content based on action
        email_configs = {
            'login': {
                'subject': '🔐 Your secure login link',
                'template': 'emails/magic_link_login.html'
            },
            'register': {
                'subject': '🎉 Verify your email to get started',
                'template': 'emails/magic_link_verify.html'
            },
            'invite': {
                'subject': '👋 You\'re invited to join a team',
                'template': 'emails/magic_link_invite.html'
            }
        }

        config = email_configs.get(action, email_configs['login'])

        html_content = render_to_string(config['template'], {
            'magic_link': link_url,
            'email': magic_token.email,
            'expires_at': magic_token.expires_at,
            'company_name': getattr(settings, 'COMPANY_NAME', 'CRM SaaS'),
            'support_email': getattr(settings, 'SUPPORT_EMAIL', 'support@yourcrm.com'),
            'action': action,
            'user': magic_token.user
        })

        send_mail(
            subject=config['subject'],
            message='Please use an HTML-capable email client to view this message.',
            from_email=getattr(settings, 'DEFAULT_FROM_EMAIL',
                               'noreply@yourcrm.com'),
            recipient_list=[magic_token.email],
            html_message=html_content,
            fail_silently=False
        )

        return True
    except Exception as e:
        print(f"Failed to send magic link email: {e}")
        return False
