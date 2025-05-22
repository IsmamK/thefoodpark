# # In your Django app's signals.py or any other appropriate module

# from django.db.models.signals import post_save
# from django.dispatch import receiver
# from django.contrib.auth.models import Group
# from djoser.signals import user_registered

# @receiver(user_registered)
# def assign_default_group(sender, user, request, **kwargs):
#     # Assuming 'customer' is the name of the group
#     group, created = Group.objects.get_or_create(name='Customer')
#     user.groups.add(group)

# # signals.py
# from django.db.models.signals import post_save
# from django.dispatch import receiver
# from .models import Order, OrderItem
# from django.conf import settings
# from facebook_business.api import FacebookAdsApi
# from facebook_business.adobjects.serverside.event_request import EventRequest
# from facebook_business.adobjects.serverside.event import Event
# from facebook_business.adobjects.serverside.user_data import UserData
# from facebook_business.adobjects.serverside.content import Content,DeliveryCategory
# from facebook_business.adobjects.serverside.custom_data import CustomData
# import time

# @receiver(post_save, sender=Order)
# def send_order_to_facebook(sender, instance, created, **kwargs):
#     # Ensure the order is updated and status is "placed"
#     if not created and instance.status == 'placed':
#         send_event_to_facebook(instance)

# def send_event_to_facebook(order):
#     try:
#         # Initialize Facebook API with access token
#         FacebookAdsApi.init(access_token=settings.FACEBOOK_CAPI_ACCESS_TOKEN)

#         # Prepare user data (emails and phone numbers should be dynamically taken from the order)
#         user_data = UserData(
#             # emails=[order.email],  # Use order's email field (make sure email is in order model)
#             # phones=[order.phone_number],  # Use the customer's phone number
#             client_ip_address = order.client_ip_address,
#             # client_user_agent='user_agent',  # Optionally, use actual user agent
#         )

#         # Prepare the content dynamically (e.g., order items)
#         contents = []
#         for item in order.order_items.all():
#             content = Content(
#                 product_id=str(item.product.id),  # Dynamically get product ID
#                 quantity=item.quantity,
#                 delivery_category=DeliveryCategory.HOME_DELIVERY,
#             )
#             contents.append(content)

#         # Custom data (e.g., total value of the order)
#         custom_data = CustomData(
#             contents=contents,
#             currency="BDT",  # Currency is set to Bangladeshi Taka
#             value=float(order.grandtotal),  # Total value of the order
#         )

#         # Create the event for the "Purchase" action
#         event = Event(
#             event_name='Purchase',
#             event_time=int(time.time()),  # Use the current timestamp
#             user_data=user_data,
#             custom_data=custom_data,
#             event_source_url=f'https://thefoodpark.xyz/order-success',  # URL of the order page
#         )

#         events = [event]

#         # Create and execute the EventRequest to Facebook
#         event_request = EventRequest(
#             events=events,
#             pixel_id=settings.FACEBOOK_PIXEL_ID,  # Get the Pixel ID from settings
#         )

#         event_response = event_request.execute()
#         print(event_response)

#     except Exception as e:
#         # Log the error for easier debugging
#         print(f"Error sending order to Facebook: {str(e)}")
