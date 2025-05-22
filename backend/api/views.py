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
# --------------------------------------- Categories ---------------------------------------



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
    
    def perform_create(self, serializer):
        client_ip = self.request.META.get('REMOTE_ADDR')
        serializer.save(client_ip_address=client_ip)


class SingleOrder(generics.RetrieveUpdateDestroyAPIView):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        data = request.data
        
        # Handle discount code update
        if 'discount_code' in data:
            try:
                discount = Discount.objects.get(code=data['discount_code'])
                instance.discount = discount
                data.pop('discount_code')
            except Discount.DoesNotExist:
                return Response(
                    {"error": "Invalid discount code"},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        # Update other fields
        serializer = self.get_serializer(instance, data=data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        return Response(serializer.data)
    
# --------------------------------------- OrderItems ---------------------------------------

class AllOrderItems(generics.ListCreateAPIView):
    queryset = OrderItem.objects.all()
    serializer_class = OrderItemSerializer
   

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
                try:
                    # Get active discount
                    discount = Discount.objects.get(
                        code__iexact=discount_code,
                        start_date__lte=timezone.now(),
                        end_date__gte=timezone.now()
                    )
                    
                    # Get product IDs from cart
                    product_ids = [item['id'] for item in cart_items]
                    
                    # Get applicable products
                    applicable_products = Product.objects.filter(id__in=product_ids)
                    
                    # Filter products that match discount conditions
                    if discount.products.exists():
                        applicable_products = applicable_products.filter(
                            id__in=discount.products.values_list('id', flat=True)
                        )
                    elif discount.subcategories.exists():
                        applicable_products = applicable_products.filter(
                            sub_category__in=discount.subcategories.all()
                        )
                    elif discount.categories.exists():
                        applicable_products = applicable_products.filter(
                            sub_category__parent_category__in=discount.categories.all()
                        )
                    
                    if applicable_products.exists():
                        # Calculate discount for applicable items
                        applicable_items = [
                            item for item in cart_items 
                            if item['id'] in [p.id for p in applicable_products]
                        ]
                        
                        if discount.is_percentage:
                            applicable_total = sum(
                                Decimal(str(item['price'])) * int(item['quantity']) 
                                for item in applicable_items
                            )
                            discount_amount = applicable_total * (discount.amount / Decimal('100'))
                        else:
                            total_quantity = sum(int(item['quantity']) for item in applicable_items)
                            discount_amount = discount.amount * total_quantity
                    else:
                        return Response(
                            {"error": "Discount not applicable to any items in cart"},
                            status=status.HTTP_400_BAD_REQUEST
                        )
                        
                except Discount.DoesNotExist:
                    return Response(
                        {"error": "Invalid or expired discount code"},
                        status=status.HTTP_404_NOT_FOUND
                    )
            
            return Response({
                "discount_amount": str(discount_amount),
                "subtotal": str(subtotal),
                "grand_total": str(subtotal - discount_amount)
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


# end