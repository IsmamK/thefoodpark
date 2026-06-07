from rest_framework import serializers
from .models import *

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'


class BannerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Banner
        fields = '__all__'



class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = '__all__'

class SubCategorySerializer(serializers.ModelSerializer):
    products = ProductSerializer(many=True, read_only=True)
    class Meta:
        model = SubCategory
        fields = '__all__'
        
class DiscountSerializer(serializers.ModelSerializer):
    categories = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all(), many=True, required=False)
    subcategories = serializers.PrimaryKeyRelatedField(queryset=SubCategory.objects.all(), many=True, required=False)
    products = serializers.PrimaryKeyRelatedField(queryset=Product.objects.all(), many=True, required=False)

    class Meta:
        model = Discount
        fields = '__all__'



# Add ExpenseSerializer
class ExpenseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Expense
        fields = '__all__'

# serializers.py - CLEAN VERSION

class OrderItemSerializer(serializers.ModelSerializer):
    # Make product optional (for custom items without product ID)
    product = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(), 
        required=False, 
        allow_null=True
    )
    product_name = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'order', 'product', 'product_name', 'price', 'quantity']
        extra_kwargs = {
            'order': {'required': False},
        }

    def get_product_name(self, obj):
        return obj.product_name or (obj.product.title if obj.product else '')


class OrderSerializer(serializers.ModelSerializer):
    order_items = OrderItemSerializer(many=True, required=False, write_only=True)

    class Meta:
        model = Order
        fields = '__all__'

    def create(self, validated_data):
        order_items_data = validated_data.pop('order_items', [])
        order = Order.objects.create(**validated_data)
        
        for item_data in order_items_data:
            OrderItem.objects.create(order=order, **item_data)
            
        return order
    
    def update(self, instance, validated_data):
        order_items_data = validated_data.pop('order_items', None)
        instance = super().update(instance, validated_data)
        
        if order_items_data is not None:
            # Only update items if explicitly provided
            instance.order_items.all().delete()
            for item_data in order_items_data:
                OrderItem.objects.create(order=instance, **item_data)
        
        return instance


class OrderSerializer(serializers.ModelSerializer):
    order_items = OrderItemSerializer(many=True, required=False)

    class Meta:
        model = Order
        fields = '__all__'

    def create(self, validated_data):
        order_items_data = validated_data.pop('order_items', [])
        order = Order.objects.create(**validated_data)
        
        for item_data in order_items_data:
            OrderItem.objects.create(order=order, **item_data)
            
        return order
    
    def update(self, instance, validated_data):
        order_items_data = validated_data.pop('order_items', None)
        instance = super().update(instance, validated_data)
        
        if order_items_data is not None:
            # Clear existing items and add new ones
            instance.order_items.all().delete()
            for item_data in order_items_data:
                OrderItem.objects.create(order=instance, **item_data)
        
        return instance