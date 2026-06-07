from django.shortcuts import render
from .models import * 
from .serializers import *
from rest_framework import generics
from rest_framework.response import Response
from rest_framework import status
from django.http import Http404
from rest_framework import filters
from djoser.serializers import UserSerializer
from django.conf import settings
from django.contrib.auth.models import Group
from django.utils import timezone
from datetime import timedelta
from django_filters.rest_framework import DjangoFilterBackend 
 # Correct import statement
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes
from rest_framework import filters
from django.http import StreamingHttpResponse
import time
import json
from .facebook_capi import FacebookCAPI
# --------------------------------------- Categories ---------------------------------------

"For deployment, use the following command to run the server: python manage.py runserver"
from django.http import JsonResponse
from .models import Product


# foodpark/views.py

class ProductListView(generics.ListCreateAPIView):
    queryset = Product.objects.select_related('sub_category')\
        .prefetch_related('discounts').all()  # Optimize query using select_related and prefetch_related
    serializer_class = ProductSerializer

    # You can further optimize this by applying filters on the database directly.
    def get_queryset(self):
        queryset = super().get_queryset()

        # Apply filters
        is_active = self.request.query_params.get('is_active', None)
        sub_category = self.request.query_params.get('sub_category', None)

        if is_active is not None:
            queryset = queryset.filter(is_active=is_active)
        if sub_category:
            queryset = queryset.filter(sub_category_id=sub_category)

        return queryset

class Categories(generics.ListCreateAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

    filter_backends = [filters.SearchFilter, filters.OrderingFilter, DjangoFilterBackend]
    filterset_fields = ["is_active"]
    search_fields = ['name']
    ordering_fields = ['priority']

class Category(generics.RetrieveUpdateDestroyAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

# Banners



class BannerList(generics.ListCreateAPIView):
    queryset = Banner.objects.all()
    serializer_class = BannerSerializer

    filter_backends = [filters.SearchFilter, filters.OrderingFilter, DjangoFilterBackend]
    filterset_fields = ["active"]
    search_fields = ['name']
    ordering_fields = ['priority']

class BannerRetrieve(generics.RetrieveUpdateDestroyAPIView):
    queryset = Banner.objects.all()
    serializer_class = BannerSerializer
  

# --------------------------------------- SubCategories ---------------------------------------

class Subcategories(generics.ListCreateAPIView):
    queryset = SubCategory.objects.all()
    serializer_class = SubCategorySerializer

    filter_backends = [filters.SearchFilter, filters.OrderingFilter,DjangoFilterBackend]
    filterset_fields = ["is_active","parent_category"]
    search_fields = ['name']
    ordering_fields = ['priority']  

class Subcategory(generics.RetrieveUpdateDestroyAPIView):
    queryset = SubCategory.objects.all()
    serializer_class = SubCategorySerializer

# --------------------------------------- Products ---------------------------------------

class ProductListView(generics.ListCreateAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

    filter_backends = [filters.SearchFilter, filters.OrderingFilter,DjangoFilterBackend]
    filterset_fields = ["is_active","sub_category"]
    search_fields = ['title']  
    ordering_fields = ['price', 'created_at','is_active']


class ProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer







# --------------------------------------- Orders ---------------------------------------


# views.py - Updated AllOrders

class AllOrders(generics.ListCreateAPIView):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    ordering_fields = ['order_time']

    def get_queryset(self):
        queryset = super().get_queryset()
        status = self.request.query_params.get('status')
        if status:
            statuses = status.split(',')
            queryset = queryset.filter(status__in=statuses)
        return queryset
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        
        if not serializer.is_valid():
            # Return detailed error message for debugging
            return Response({
                'error': 'Validation failed',
                'details': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            client_ip = request.META.get('REMOTE_ADDR')
            order = serializer.save(client_ip_address=client_ip)
            return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

# foodpark/views.py

class SingleOrder(generics.RetrieveUpdateDestroyAPIView):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        data = request.data

        # Apply discount code efficiently
        if 'discount_code' in data:
            discount_code = data.get('discount_code')
            try:
                discount = Discount.objects.get(code__iexact=discount_code)
                instance.discount = discount
                data.pop('discount_code')
            except Discount.DoesNotExist:
                return Response({"error": "Invalid discount code"}, status=status.HTTP_400_BAD_REQUEST)

        # Update other fields
        serializer = self.get_serializer(instance, data=data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        return Response(serializer.data)
# --------------------------------------- OrderItems ---------------------------------------

class AllOrderItems(generics.ListCreateAPIView):
    queryset = OrderItem.objects.all()
    serializer_class = OrderItemSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['order']
   

class SingleOrderItem(generics.RetrieveUpdateDestroyAPIView):
    queryset = OrderItem.objects.all()
    serializer_class = OrderItemSerializer
    

# --------------------------------------- Discounts ---------------------------------------

class AllDiscounts(generics.ListCreateAPIView):
    queryset = Discount.objects.all()
    serializer_class = DiscountSerializer

class SingleDiscount(generics.RetrieveUpdateDestroyAPIView):
    queryset = Discount.objects.all()
    serializer_class = DiscountSerializer

from django.db.models import Q
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from .models import Discount, Product  # Make sure to import Product
from decimal import Decimal
# foodpark/views.py

class ApplyDiscountView(APIView):
    def post(self, request, *args, **kwargs):
        discount_code = request.data.get('discount_code')
        cart_items = request.data.get('cart_items', [])

        if not cart_items:
            return Response({"error": "No items in cart"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Calculate subtotal using Decimal
            subtotal = sum(Decimal(str(item['price'])) * int(item['quantity']) for item in cart_items)
            discount_amount = Decimal('0')

            if discount_code:
                # Get active discount, filter products at the database level
                discount = Discount.objects.filter(
                    code__iexact=discount_code,
                    start_date__lte=timezone.now(),
                    end_date__gte=timezone.now()
                ).first()

                if discount:
                    # Get applicable products based on the discount's conditions
                    applicable_products = Product.objects.filter(id__in=[item['id'] for item in cart_items])

                    # Apply product-related filters
                    if discount.products.exists():
                        applicable_products = applicable_products.filter(id__in=discount.products.values_list('id', flat=True))
                    if discount.subcategories.exists():
                        applicable_products = applicable_products.filter(sub_category__in=discount.subcategories.all())
                    if discount.categories.exists():
                        applicable_products = applicable_products.filter(sub_category__parent_category__in=discount.categories.all())

                    if applicable_products.exists():
                        applicable_items = [item for item in cart_items if item['id'] in applicable_products.values_list('id', flat=True)]
                        
                        if discount.is_percentage:
                            applicable_total = sum(Decimal(str(item['price'])) * int(item['quantity']) for item in applicable_items)
                            discount_amount = applicable_total * (discount.amount / Decimal('100'))
                        else:
                            total_quantity = sum(int(item['quantity']) for item in applicable_items)
                            discount_amount = discount.amount * total_quantity
                    else:
                        return Response({"error": "Discount not applicable to any items in cart"}, status=status.HTTP_400_BAD_REQUEST)
                else:
                    return Response({"error": "Invalid or expired discount code"}, status=status.HTTP_404_NOT_FOUND)

            return Response({
                "discount_amount": str(discount_amount),
                "subtotal": str(subtotal),
                "grand_total": str(subtotal - discount_amount)
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
# end

# CAPI

from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Product
from .facebook_capi import FacebookCAPI
# Add these to your existing views.py

import logging

logger = logging.getLogger(__name__)

from rest_framework.decorators import api_view
from rest_framework.response import Response
from .facebook_capi import FacebookCAPI
import logging

logger = logging.getLogger(__name__)

# foodpark/views.py

@api_view(['POST'])
def track_view_content(request):
    product_data = request.data.get('product')
    if not product_data:
        return Response({'error': 'Product data required'}, status=400)

    required_fields = ['id', 'title', 'price']
    if not all(field in product_data for field in required_fields):
        return Response({'error': 'Missing required product fields'}, status=400)

    # Efficiently handle product price and other details
    product_price = float(product_data.get('price', 0))
    product_data.setdefault('currency', 'BDT')

    event_data = {
        'event_name': 'ViewContent',
        'event_time': int(timezone.now().timestamp()),
        'event_source_url': request.build_absolute_uri(),
        'user_data': {
            'client_ip_address': request.META.get('REMOTE_ADDR'),
            'client_user_agent': request.META.get('HTTP_USER_AGENT'),
            'em': product_data.get('user_email'),
            'ph': product_data.get('user_phone'),
        },
        'custom_data': {
            'content_name': product_data.get('title'),
            'content_ids': [product_data.get('id')],
            'content_type': 'product',
            'currency': product_data.get('currency'),
            'value': product_price,
        }
    }

    # Send the event in the background
    send_facebook_event.delay(event_data)

    return Response({'status': 'success'})
@api_view(['POST'])
def track_add_to_cart(request):
    try:
        product_data = request.data.get('product')
        if not product_data:
            return Response({'error': 'Product data required', 'debug': None}, status=400)
            
        if not isinstance(product_data, dict):
            return Response({'error': 'Product data must be a dictionary', 'debug': None}, status=400)
            
        required_fields = ['id', 'title', 'price']
        missing_fields = [field for field in required_fields if field not in product_data]
        if missing_fields:
            return Response({
                'error': f'Missing required product fields: {missing_fields}',
                'debug': None
            }, status=400)
            
        product_data.setdefault('user_email', None)
        product_data.setdefault('user_phone', None)
        product_data.setdefault('currency', 'BDT')
        product_data.setdefault('quantity', 1)
        
        capi = FacebookCAPI()
        result = capi.send_add_to_cart(request, product_data)
        
        # Enhanced response with debugging info
        response_data = {
            'status': 'success' if not result.get('error') else 'error',
            'event': 'AddToCart',
            'event_id': result.get('event_id'),
            'facebook_response': result.get('facebook_response'),
            'matched_parameters': result.get('matched_parameters'),
            'sent_payload': result.get('sent_payload'),
            'error': result.get('error'),
        }
        
        if isinstance(result, dict) and 'error' in result:
            logger.error(f"Facebook CAPI Error: {result['error']}")
            return Response(response_data, status=500)
        
        return Response(response_data)
        
    except Exception as e:
        logger.error(f"Error in track_add_to_cart: {str(e)}", exc_info=True)
        return Response({
            'error': str(e),
            'status': 'error',
            'facebook_response': None,
            'debug': None
        }, status=500)


@api_view(['POST'])
def track_checkout(request):
    try:
        checkout_data = request.data.get('checkout')
        if not checkout_data or not checkout_data.get('items'):
            return Response({
                'error': 'Checkout data with items required',
                'debug': None
            }, status=400)
        
        checkout_data.setdefault('user_email', None)
        checkout_data.setdefault('user_phone', None)
        checkout_data.setdefault('currency', 'BDT')
        
        capi = FacebookCAPI()
        result = capi.send_initiate_checkout(request, checkout_data)
        
        # Enhanced response with debugging info
        response_data = {
            'status': 'success' if not result.get('error') else 'error',
            'event': 'InitiateCheckout',
            'event_id': result.get('event_id'),
            'facebook_response': result.get('facebook_response'),
            'matched_parameters': result.get('matched_parameters'),
            'sent_payload': result.get('sent_payload'),
            'error': result.get('error'),
        }
        
        if isinstance(result, dict) and 'error' in result:
            logger.error(f"Facebook CAPI Error: {result['error']}")
            return Response(response_data, status=500)
        
        return Response(response_data)
        
    except Exception as e:
        logger.error(f"Error in track_checkout: {str(e)}", exc_info=True)
        return Response({
            'error': str(e),
            'status': 'error',
            'facebook_response': None,
            'debug': None
        }, status=500)
    
@api_view(['POST'])
def track_purchase(request):
    try:
        # Enhanced input validation
        purchase_data = request.data.get('purchase', {})
        if not purchase_data:
            return Response({
                'status': 'error',
                'error': 'Purchase data is required',
                'debug': None
            }, status=400)
            
        # Required fields validation with clearer error messages
        required_fields = ['order_id', 'items', 'value']
        missing_fields = [field for field in required_fields if field not in purchase_data]
        
        if missing_fields:
            return Response({
                'status': 'error',
                'error': f'Missing required fields: {", ".join(missing_fields)}',
                'debug': None
            }, status=400)
        
        # Validate items structure
        if not isinstance(purchase_data['items'], list):
            return Response({
                'status': 'error',
                'error': 'Items must be an array',
                'debug': None
            }, status=400)
            
        # Validate each item in items
        for item in purchase_data['items']:
            if not isinstance(item, dict):
                return Response({
                    'status': 'error',
                    'error': 'Each item must be an object',
                    'debug': None
                }, status=400)
                
            if 'id' not in item or 'price' not in item:
                return Response({
                    'status': 'error',
                    'error': 'Each item must have id and price',
                    'debug': None
                }, status=400)
        
        # Process the purchase
        capi = FacebookCAPI()
        result = capi.send_purchase(request, purchase_data)
        
        # Standardize the response format
        response_data = {
            'status': result.get('status', 'error'),
            'event': 'Purchase',
            'event_id': result.get('event_id'),
            'facebook_response': result.get('facebook_response'),
            'error': result.get('error'),
        }
        
        # Return appropriate status code based on result
        status_code = 200 if response_data['status'] == 'success' else 500
        return Response(response_data, status=status_code)
        
    except Exception as e:
        logger.error(f"Error in track_purchase: {str(e)}", exc_info=True)
        return Response({
            'status': 'error',
            'error': str(e),
            'facebook_response': None,
            'debug': None
        }, status=500)
    
    
# Add to your existing views.py
class FeaturedProductListView(generics.ListAPIView):
    serializer_class = ProductSerializer
    
    def get_queryset(self):
        queryset = Product.objects.filter(is_active=True)
        
        # Option 1: If you have a dedicated 'featured' field
        if hasattr(Product, 'is_featured'):
            return queryset.filter(is_featured=True).order_by('-created_at')[:3]
        
        # Option 2: Manual selection by IDs
        featured_ids = settings.FEATURED_PRODUCT_IDS  # Add to settings.py
        if featured_ids:
            return queryset.filter(id__in=featured_ids)
        
        # Option 3: Fallback to most popular
        return queryset.annotate(
            order_count=Count('order_items')
        ).order_by('-order_count')[:3]
    


# Add these views

class AllExpenses(generics.ListCreateAPIView):
    queryset = Expense.objects.all()
    serializer_class = ExpenseSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['category']
    ordering_fields = ['date', 'amount']

    def get_queryset(self):
        qs = super().get_queryset()
        year = self.request.query_params.get('year')
        month = self.request.query_params.get('month')
        if year:
            qs = qs.filter(date__year=year)
        if month:
            qs = qs.filter(date__month=month)
        return qs

class SingleExpense(generics.RetrieveUpdateDestroyAPIView):
    queryset = Expense.objects.all()
    serializer_class = ExpenseSerializer

# Customer history by phone number
class CustomerOrderHistory(APIView):
    def get(self, request):
        phone = request.query_params.get('phone')
        if not phone:
            return Response({'error': 'phone required'}, status=400)
        orders = Order.objects.filter(phone_number=phone).order_by('-order_time')
        # Serialize with nested order items
        orders_data = []
        for order in orders:
            order_data = OrderSerializer(order).data
            items = OrderItem.objects.filter(order=order)
            order_data['order_items'] = OrderItemSerializer(items, many=True).data
            orders_data.append(order_data)
        return Response({'count': orders.count(), 'orders': orders_data})