import requests
import json
from datetime import datetime
from django.utils import timezone
from django.conf import settings
from django.core.cache import cache
import logging

logger = logging.getLogger(__name__)


class ZohoSignService:
    def __init__(self):
        self.client_id = settings.ZOHO_CLIENT_ID
        self.client_secret = settings.ZOHO_CLIENT_SECRET
        self.redirect_uri = settings.ZOHO_REDIRECT_URI
        self.scope = settings.ZOHO_SCOPE
        self.accounts_url = settings.ZOHO_ACCOUNTS_URL
        self.api_url = settings.ZOHO_SIGN_API_URL

    def get_auth_url(self):
        """Generate Zoho OAuth authorization URL"""
        auth_url = f"{self.accounts_url}/oauth/v2/auth"
        params = {
            'scope': self.scope,
            'client_id': self.client_id,
            'response_type': 'code',
            'redirect_uri': self.redirect_uri,
            'access_type': 'offline'
        }

        query_string = '&'.join([f"{k}={v}" for k, v in params.items()])
        return f"{auth_url}?{query_string}"

    def get_access_token(self, auth_code):
        """Exchange authorization code for access token"""
        token_url = f"{self.accounts_url}/oauth/v2/token"

        data = {
            'grant_type': 'authorization_code',
            'client_id': self.client_id,
            'client_secret': self.client_secret,
            'redirect_uri': self.redirect_uri,
            'code': auth_code
        }

        response = requests.post(token_url, data=data)
        token_data = response.json()

        if response.status_code == 200:
            # Cache the tokens
            cache.set('zoho_access_token',
                      token_data['access_token'], timeout=3600)
            cache.set('zoho_refresh_token',
                      token_data['refresh_token'], timeout=None)
            return token_data
        else:
            raise Exception(f"Failed to get access token: {token_data}")

    def refresh_access_token(self):
        """Refresh access token using refresh token"""
        refresh_token = cache.get('zoho_refresh_token')
        if not refresh_token:
            raise Exception("No refresh token available")

        token_url = f"{self.accounts_url}/oauth/v2/token"

        data = {
            'grant_type': 'refresh_token',
            'client_id': self.client_id,
            'client_secret': self.client_secret,
            'refresh_token': refresh_token
        }

        response = requests.post(token_url, data=data)
        token_data = response.json()

        if response.status_code == 200:
            cache.set('zoho_access_token',
                      token_data['access_token'], timeout=3600)
            return token_data['access_token']
        else:
            raise Exception(f"Failed to refresh token: {token_data}")

    def get_valid_token(self):
        """Get a valid access token (refresh if needed)"""
        token = cache.get('zoho_access_token')
        if not token:
            token = self.refresh_access_token()
        return token

    def send_document_from_template(self, template_id, recipients, document_details=None):
        """
        Send document from template using Zoho's /templates/{template_id}/createdocument endpoint
        """
        token = self.get_valid_token()

        headers = {
            'Authorization': f'Zoho-oauthtoken {token}',
            'Content-Type': 'application/json'
        }

        # Build the request payload for template-based document creation
        request_data = {
            "requests": {
                "request_name": f"NDIS Service Agreement - {timezone.now().strftime('%Y-%m-%d %H:%M')}",
                "request_type_name": "Send to Sign",
                "expiration_days": 30,
                "is_sequential": True,
                "actions": []
            }
        }

        # Add recipients as actions
        for recipient in recipients:
            action = {
                "action_type": recipient.get("action_type", "SIGN"),
                "recipient_name": recipient["recipient_name"],
                "recipient_email": recipient["recipient_email"],
                "signing_order": recipient.get("signing_order", 0),
                "verify_recipient": False,
                "is_embedded": recipient.get("is_embedded", False),
                "private_notes": recipient.get("private_notes", "")
            }

            # Add action_id if provided (for specific template roles)
            if recipient.get("action_id"):
                action["action_id"] = recipient["action_id"]

            request_data["requests"]["actions"].append(action)

        # Add field data if provided
        if document_details and document_details.get("field_values"):
            request_data["requests"]["field_data"] = {
                "field_text_data": document_details["field_values"],
                "field_boolean_data": {},
                "field_date_data": {
                    "agreement_date": timezone.now().strftime('%Y-%m-%d')
                }
            }

        logger.info(
            f"Sending document request to Zoho template {template_id}: {json.dumps(request_data, indent=2)}")

        # Use the specific template endpoint that Zoho provided you
        response = requests.post(
            f"{self.api_url}/templates/{template_id}/createdocument",
            headers=headers,
            json=request_data
        )

        if response.status_code == 200:
            return response.json()
        else:
            logger.error(
                f"Failed to send document: {response.status_code} - {response.text}")
            raise Exception(f"Failed to send document: {response.text}")

    def get_embedded_signing_url(self, request_id, action_id):
        """Get embedded signing URL for specific action"""
        token = self.get_valid_token()

        headers = {
            'Authorization': f'Zoho-oauthtoken {token}'
        }

        # First get the embed token
        response = requests.get(
            f"{self.api_url}/requests/{request_id}/actions/{action_id}/embedtoken",
            headers=headers
        )

        if response.status_code == 200:
            embed_data = response.json()
            embed_token = embed_data.get('embed_token')

            if embed_token:
                return f"{self.api_url}/requests/{request_id}/actions/{action_id}/embed?embed_token={embed_token}"
            else:
                raise Exception("No embed token received from Zoho")
        else:
            logger.error(
                f"Failed to get embed token: {response.status_code} - {response.text}")
            raise Exception(f"Failed to get embed URL: {response.text}")

    def get_document_status(self, request_id):
        """Check document signing status"""
        token = self.get_valid_token()

        headers = {
            'Authorization': f'Zoho-oauthtoken {token}'
        }

        response = requests.get(
            f"{self.api_url}/requests/{request_id}",
            headers=headers
        )

        if response.status_code == 200:
            return response.json()
        else:
            raise Exception(f"Failed to get document status: {response.text}")

    def download_signed_document(self, request_id):
        """Download completed signed document"""
        token = self.get_valid_token()

        headers = {
            'Authorization': f'Zoho-oauthtoken {token}'
        }

        response = requests.get(
            f"{self.api_url}/requests/{request_id}/pdf",
            headers=headers
        )

        if response.status_code == 200:
            return response.content
        else:
            raise Exception(f"Failed to download document: {response.text}")

    def get_action_id_for_recipient(self, request_id, recipient_email):
        """Get action_id for a specific recipient in a document"""
        token = self.get_valid_token()

        headers = {
            'Authorization': f'Zoho-oauthtoken {token}'
        }

        response = requests.get(
            f"{self.api_url}/requests/{request_id}",
            headers=headers
        )

        if response.status_code == 200:
            data = response.json()
            actions = data.get('requests', {}).get('actions', [])

            for action in actions:
                if action.get('recipient_email') == recipient_email:
                    return action.get('action_id')

            raise Exception(
                f"No action found for recipient: {recipient_email}")
        else:
            raise Exception(f"Failed to get document details: {response.text}")

    def list_templates(self):
        """List available templates"""
        token = self.get_valid_token()

        headers = {
            'Authorization': f'Zoho-oauthtoken {token}'
        }

        response = requests.get(
            f"{self.api_url}/templates",
            headers=headers
        )

        if response.status_code == 200:
            return response.json()
        else:
            raise Exception(f"Failed to list templates: {response.text}")

    def get_template_details(self, template_id):
        """Get details of a specific template"""
        token = self.get_valid_token()

        headers = {
            'Authorization': f'Zoho-oauthtoken {token}'
        }

        response = requests.get(
            f"{self.api_url}/templates/{template_id}",
            headers=headers
        )

        if response.status_code == 200:
            return response.json()
        else:
            raise Exception(f"Failed to get template details: {response.text}")

    def _send_document_request(self, document_data):
        """Internal method to send document request to Zoho"""
        token = self.get_valid_token()

        headers = {
            'Authorization': f'Zoho-oauthtoken {token}',
            'Content-Type': 'application/json'
        }

        logger.info(
            f"Sending document request: {json.dumps(document_data, indent=2)}")

        response = requests.post(
            f"{self.api_url}/requests",
            headers=headers,
            json=document_data
        )

        if response.status_code == 200:
            return response.json()
        else:
            logger.error(
                f"Failed to send document: {response.status_code} - {response.text}")
            raise Exception(f"Failed to send document: {response.text}")
