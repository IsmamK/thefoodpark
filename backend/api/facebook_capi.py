import requests
import hashlib
import json
from django.conf import settings
from django.utils import timezone
import logging
from datetime import datetime
from rest_framework.decorators import api_view
from rest_framework.response import Response

import json
import hashlib
from django.utils import timezone
import logging

logger = logging.getLogger(__name__)


import hashlib


class FacebookCAPI:
    def __init__(self):
        self.pixel_id = settings.FACEBOOK_PIXEL_ID
        self.access_token = settings.FACEBOOK_ACCESS_TOKEN
        self.api_version = 'v18.0'
        self.api_url = f'https://graph.facebook.com/{self.api_version}/{self.pixel_id}/events'
        self.debug_mode = getattr(settings, 'DEBUG', False)
        self.fbp_cookie_name = '_fbp'
        self.fbc_cookie_name = '_fbc'
        
        logger.info(f"Facebook CAPI Initialized | Pixel ID: {self.pixel_id}")

    def _hash(self, value):
        if not value:
            return ''
        return hashlib.sha256(value.strip().lower().encode('utf-8')).hexdigest()


    def _log_success(self, event_name, event_id, additional_info=None):
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        success_message = f"""
        SUCCESSFUL EVENT REPORTING
        Time: {timestamp}
        Event: {event_name}
        Event ID: {event_id}
        """
        
        if additional_info:
            success_message += f"Details: {additional_info}\n"
        
        logger.info(success_message)
        print(success_message)

    def _hash_data(self, data):
        if not data:
            return None
        return hashlib.sha256(data.lower().encode('utf-8')).hexdigest()
    
    def _get_user_data(self, request):
        """Extract all available user data from request"""
        
        user_data = {
            'client_ip_address': request.META.get('REMOTE_ADDR'),
            'client_user_agent': request.META.get('HTTP_USER_AGENT'),
            'em': self._hash_data(request.data.get('user_email')),
            'ph': self._hash_data(request.data.get('user_phone')),
        }
        
        # Add browser cookies if available
        fbp = request.COOKIES.get(self.fbp_cookie_name)
        fbc = request.COOKIES.get(self.fbc_cookie_name)
        
        if fbp:
            user_data['fbp'] = fbp
        if fbc:
            user_data['fbc'] = fbc
            
        # Add external ID if user is authenticated
        if hasattr(request, 'user') and request.user.is_authenticated:
            user_data['external_id'] = str(request.user.id)
            
        return user_data

    def _send_event(self, event_data):
        """Send event to Facebook CAPI and return full response"""
        headers = {'Content-Type': 'application/json'}
        payload = {
            'data': [event_data],
            'access_token': self.access_token,
            'test_event_code': getattr(settings, 'FACEBOOK_TEST_EVENT_CODE', None),
        }
        
        debug_info = {
            'sent_payload': payload,
            'facebook_response': None,
            'matched_parameters': None,
            'event_id': event_data.get('event_id'),
        }

        if self.debug_mode:
            debug_output = {
                'debug_mode': True,
                'event_name': event_data['event_name'],
                'event_id': event_data['event_id'],
                'status': 'would_be_sent_in_production',
                'payload': payload,
            }
            logger.debug(f"DEBUG EVENT: {json.dumps(debug_output, indent=2)}")
            debug_info['facebook_response'] = debug_output
            return debug_info
        
        try:
            logger.info(f"Sending {event_data['event_name']} event to Facebook...")
            response = requests.post(self.api_url, headers=headers, data=json.dumps(payload))
            response.raise_for_status()
            response_data = response.json()
            
            # Store the complete Facebook response
            debug_info['facebook_response'] = response_data
            
            # FIXED: Handle Facebook response structure correctly
            if isinstance(response_data, dict):
                debug_info['matched_parameters'] = {
                    'events_received': response_data.get('events_received', 0),  # This is an INTEGER
                    'fbtrace_id': response_data.get('fbtrace_id'),
                    'matched_events': [],
                }
                
                # FIXED: Check for events array in response, not events_received
                events_array = response_data.get('events', [])
                if isinstance(events_array, list):
                    for event in events_array:
                        if isinstance(event, dict):
                            debug_info['matched_parameters']['matched_events'].append({
                                'event_id': event.get('id'),
                                'matched_user_data': event.get('match_keys', []),
                                'diagnostics': event.get('diagnostics', {}),
                            })
            
            # Log success with all debug info
            self._log_success(
                event_data['event_name'],
                event_data['event_id'],
                f"Facebook Response: {json.dumps(debug_info, indent=2)}"
            )
            
            return debug_info
            
        except requests.exceptions.HTTPError as http_err:
            error_msg = f"HTTP Error: {http_err}"
            if hasattr(http_err, 'response') and http_err.response:
                try:
                    error_msg += f"\nResponse: {http_err.response.text}"
                    debug_info['facebook_response'] = http_err.response.json()
                except:
                    error_msg += f"\nStatus Code: {http_err.response.status_code}"
            logger.error(error_msg)
            debug_info['error'] = str(http_err)
            return debug_info
            
        except Exception as e:
            error_msg = f"Unexpected Error: {str(e)}"
            logger.error(error_msg)
            debug_info['error'] = str(e)
            return debug_info
        
    def send_view_content(self, request, product_data):
        try:
            if not isinstance(product_data, dict):
                raise ValueError("product_data must be a dictionary")

            product_id = str(product_data.get('id'))
            if not product_id:
                raise ValueError("Product ID is required")

            event_id = f'view_{product_id}_{int(timezone.now().timestamp())}'
            product_title = product_data.get('title', 'Unknown Product')

            try:
                product_price = float(product_data.get('price', 0))
            except (ValueError, TypeError):
                product_price = 0.0

            user_data = self._get_user_data(request)

            event_data = {
                'event_name': 'ViewContent',
                'event_time': int(timezone.now().timestamp()),
                'event_id': event_id,
                'event_source_url': request.build_absolute_uri(),
                'action_source': 'website',  # ✅ important
                'user_data': user_data,
                'custom_data': {
                    'content_name': product_title,
                    'content_ids': [product_id],
                    'content_type': 'product',
                    'currency': product_data.get('currency', 'BDT'),
                    'value': product_price,
                }
            }

            # ✅ Log/print before sending
            print("Sending ViewContent Payload to Facebook:")
            print(json.dumps(event_data, indent=2))

            result = self._send_event(event_data)

            # ✅ Log/print after sending
            print("Facebook Response:")
            print(json.dumps(result.get('facebook_response', {}), indent=2))

            return result

        except Exception as e:
            error_msg = f"Error in send_view_content: {str(e)}"
            logger.error(error_msg)
            return {"error": error_msg}

    
    def send_add_to_cart(self, request, product_data):
        try:
            # Extract product details, default empty strings or sensible defaults
            product_id = str(product_data.get('id', ''))
            product_title = product_data.get('title', '') or ''
            currency = product_data.get('currency', '') or ''
            try:
                product_price = float(product_data.get('price', 0))
            except (ValueError, TypeError):
                product_price = 0.0
            try:
                quantity = int(product_data.get('quantity', 1))
            except (ValueError, TypeError):
                quantity = 1

            event_id = f'cart_{product_id}_{int(timezone.now().timestamp())}'

            # Extract user data (send empty string if not available)
            first_name = request.data.get('first_name', '') or product_data.get('first_name', '') or ''
            last_name = request.data.get('last_name', '') or product_data.get('last_name', '') or ''
            user_phone = request.data.get('phone', '') or request.data.get('user_phone', '') or product_data.get('user_phone', '') or ''

            # Client user agent (DO NOT hash)
            client_user_agent = request.META.get("HTTP_USER_AGENT", '') or ''

            # Client IP address (also empty string if missing)
            client_ip = request.META.get("REMOTE_ADDR", '') or ''

            # Facebook cookie values
            fbp = request.COOKIES.get(self.fbp_cookie_name, '') or ''
            fbc = request.COOKIES.get(self.fbc_cookie_name, '') or ''

            # User email, hashed or empty string hashed of empty string
            user_email_raw = request.data.get('user_email', '') or product_data.get('user_email', '') or ''
            user_email_hashed = self._hash_data(user_email_raw) if user_email_raw else self._hash_data('')

            # Hash first and last names or empty strings
            fn_hashed = self._hash(first_name) if first_name else self._hash('')
            ln_hashed = self._hash(last_name) if last_name else self._hash('')

            # Hash phone or empty string
            ph_hashed = self._hash_data(user_phone) if user_phone else self._hash_data('')

            # Compose user_data with all fields present
            user_data = {
                "em": user_email_hashed or "",
                "ph": ph_hashed or "",
                "fn": fn_hashed,
                "ln": ln_hashed,
                "client_user_agent": client_user_agent,
                "client_ip_address": client_ip,
                "fbp": fbp,
                "fbc": fbc,
            }

            # Add external_id if authenticated, else empty string
            if hasattr(request, "user") and request.user.is_authenticated:
                user_data["external_id"] = str(request.user.id)
            else:
                user_data["external_id"] = ''

            # Compose the event data, with all required parameters set (empty string if missing)
            event_data = {
                "event_name": "AddToCart",
                "event_time": int(timezone.now().timestamp()),
                "event_id": event_id,
                "event_source_url": request.build_absolute_uri() or '',
                "action_source": "website",
                "user_data": user_data,
                "custom_data": {
                    "content_name": product_title,
                    "content_ids": [product_id],
                    "content_type": "product",
                    "currency": currency,
                    "value": round(product_price * quantity, 2),
                    "quantity": quantity
                }
            }

            # Log the payload to send
            logger.info("📤 Sending AddToCart Event to Facebook CAPI")
            logger.info(json.dumps(event_data, indent=2, ensure_ascii=False))

            # Send the event
            response = self._send_event(event_data)

            # Log response
            logger.info("📥 Facebook CAPI Response:")
            logger.info(json.dumps(response, indent=2, ensure_ascii=False))

            return {
                "event_id": event_id,
                "facebook_response": response,
                "sent_payload": event_data,
                "matched_parameters": list(user_data.keys())
            }

        except Exception as e:
            logger.error("Error in send_add_to_cart", exc_info=True)
            return {
                "status": "error",
                "event": "AddToCart",
                "error": str(e),
            }
        

    def send_initiate_checkout(self, request, checkout_data):
        try:
            if not isinstance(checkout_data, dict):
                raise ValueError("checkout_data must be a dictionary")
            
            event_id = f'checkout_{int(timezone.now().timestamp())}'
            items = checkout_data.get('items', [])
            if not isinstance(items, list):
                raise ValueError("checkout_data['items'] must be a list")

            content_ids = [str(item.get('id', '')) for item in items if isinstance(item, dict)]

            # Safely get currency and total_value, fallback to empty string or 0.0
            currency = checkout_data.get('currency', '') or ''
            try:
                total_value = float(checkout_data.get('total_value', 0)) or 0.0
            except (ValueError, TypeError):
                total_value = 0.0

            # Extract user info from request data or checkout_data with empty string fallback
            first_name = request.data.get('first_name', '') or checkout_data.get('first_name', '') or ''
            last_name = request.data.get('last_name', '') or checkout_data.get('last_name', '') or ''
            user_phone = request.data.get('phone', '') or checkout_data.get('user_phone', '') or ''
            user_email_raw = request.data.get('user_email', '') or checkout_data.get('user_email', '') or ''

            # Client user agent (do not hash)
            client_user_agent = request.META.get('HTTP_USER_AGENT', '') or ''

            # Client IP address fallback to empty string
            client_ip = request.META.get('REMOTE_ADDR', '') or ''

            # Facebook cookies fallback
            fbp = request.COOKIES.get(self.fbp_cookie_name, '') or ''
            fbc = request.COOKIES.get(self.fbc_cookie_name, '') or ''

            # Hash email, names, phone or hash of empty string if missing
            user_email_hashed = self._hash_data(user_email_raw) if user_email_raw else self._hash_data('')
            fn_hashed = self._hash(first_name) if first_name else self._hash('')
            ln_hashed = self._hash(last_name) if last_name else self._hash('')
            ph_hashed = self._hash_data(user_phone) if user_phone else self._hash_data('')

            user_data = {
                "em": user_email_hashed,
                "ph": ph_hashed,
                "fn": fn_hashed,
                "ln": ln_hashed,
                "client_user_agent": client_user_agent,
                "client_ip_address": client_ip,
                "fbp": fbp,
                "fbc": fbc,
            }

            if hasattr(request, "user") and request.user.is_authenticated:
                user_data["external_id"] = str(request.user.id)
            else:
                user_data["external_id"] = ''

            event_data = {
                'event_name': 'InitiateCheckout',
                'event_time': int(timezone.now().timestamp()),
                'event_id': event_id,
                'event_source_url': request.build_absolute_uri() or '',
                'action_source': 'website',
                'user_data': user_data,
                'custom_data': {
                    'content_ids': content_ids,
                    'content_type': checkout_data.get('content_type', '') or '',
                    'currency': currency,
                    'value': total_value,
                    'num_items': len(items),
                }
            }

            logger.info(f"📤 Sending InitiateCheckout Event to Facebook CAPI with {len(items)} items")
            logger.info(json.dumps(event_data, indent=2, ensure_ascii=False))

            response = self._send_event(event_data)

            logger.info("📥 Facebook CAPI Response:")
            logger.info(json.dumps(response, indent=2, ensure_ascii=False))

            return {
                "event_id": event_id,
                "facebook_response": response,
                "sent_payload": event_data,
                "matched_parameters": list(user_data.keys())
            }

        except Exception as e:
            logger.error("Error in send_initiate_checkout", exc_info=True)
            return {
                "status": "error",
                "event": "InitiateCheckout",
                "error": str(e),
                }

    def send_purchase(self, request, purchase_data):
        try:
            # Validate input data structure
            if not isinstance(purchase_data, dict):
                raise ValueError("purchase_data must be a dictionary")
            
            # Extract and validate required fields
            order_id = str(purchase_data.get('order_id', ''))
            if not order_id:
                raise ValueError("Order ID is required and must be a string")
            
            items = purchase_data.get('items', [])
            if not isinstance(items, list):
                raise ValueError("Items must be a list")
            
            try:
                value = round(float(purchase_data.get('value', 0)), 2)
            except (ValueError, TypeError):
                raise ValueError("Value must be a number")
            
            # Generate event ID
            event_id = f'purchase_{order_id}_{int(timezone.now().timestamp())}'
            
            # Prepare user data with proper fallbacks
            user_data = {
                'client_ip_address': request.META.get('REMOTE_ADDR', ''),
                'client_user_agent': request.META.get('HTTP_USER_AGENT', ''),
                'em': self._hash_data(purchase_data.get('user_email', '')),
                'ph': self._hash_data(purchase_data.get('user_phone', '')),
            }
            
            # Add Facebook cookies if available
            fbp = request.COOKIES.get(self.fbp_cookie_name)
            fbc = request.COOKIES.get(self.fbc_cookie_name)
            if fbp:
                user_data['fbp'] = fbp
            if fbc:
                user_data['fbc'] = fbc
                
            # Prepare content IDs
            content_ids = []
            for item in items:
                if isinstance(item, dict) and 'id' in item:
                    try:
                        content_ids.append(str(item['id']))
                    except (ValueError, TypeError):
                        continue
            
            # Build event payload
            event_data = {
                'event_name': 'Purchase',
                'event_time': int(timezone.now().timestamp()),
                'event_id': event_id,
                'event_source_url': request.build_absolute_uri(),
                'action_source': 'website',
                'user_data': user_data,
                'custom_data': {
                    'content_ids': content_ids,
                    'content_type': purchase_data.get('content_type', 'product'),
                    'currency': purchase_data.get('currency', 'BDT'),
                    'value': value,
                    'order_id': order_id,
                }
            }
            
            # Send the event
            response = self._send_event(event_data)
            
            # Return standardized response
            return {
                'status': 'success' if not response.get('error') else 'error',
                'event_id': event_id,
                'facebook_response': response.get('facebook_response'),
                'error': response.get('error'),
                'sent_payload': event_data,
            }
            
        except Exception as e:
            logger.error(f"Error in send_purchase: {str(e)}", exc_info=True)
            return {
                'status': 'error',
                'error': str(e),
                'facebook_response': None,
            }


# Facebook CAPI utility functions
# Additional helper function for debugging Facebook responses
def debug_facebook_response(response_data):
    """Helper function to safely debug Facebook API responses"""
    try:
        if not isinstance(response_data, dict):
            return {"error": "Response is not a dictionary"}
        
        debug_info = {
            "events_received": response_data.get('events_received', 0),
            "fbtrace_id": response_data.get('fbtrace_id', 'N/A'),
            "messages": response_data.get('messages', []),
            "events": []
        }
        
        # Safely handle events array
        events = response_data.get('events', [])
        if isinstance(events, list):
            for event in events:
                if isinstance(event, dict):
                    debug_info["events"].append({
                        "id": event.get('id'),
                        "match_keys": event.get('match_keys', []),
                        "diagnostics": event.get('diagnostics', {})
                    })
        
        return debug_info
        
    except Exception as e:
        return {"error": f"Error debugging response: {str(e)}"}

# Enhanced error handling function
def handle_capi_error(error, event_name, event_id):
    """Centralized error handling for CAPI operations"""
    error_response = {
        'status': 'error',
        'event': event_name,
        'event_id': event_id,
        'error': str(error),
        'facebook_response': None,
        'matched_parameters': None,
        'sent_payload': None
    }
    
    logger.error(f"CAPI Error in {event_name}: {str(error)}")
    return error_response