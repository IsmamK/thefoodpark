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

class OrderItemSerializer(serializers.ModelSerializer):
    product = serializers.PrimaryKeyRelatedField(queryset=Product.objects.all())
    product_name = serializers.CharField(source='product.title', read_only=True)
    price = serializers.DecimalField(source='product.price', max_digits=10, decimal_places=2, read_only=True)
    
    class Meta:
        model = OrderItem
        fields = ['id', 'order', 'product', 'product_name', 'price', 'quantity']
        extra_kwargs = {
            'order': {'required': False}
        }



# serializers.py
class OrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = '__all__'
        extra_kwargs = {
            'email': {
                'required': False,
                'allow_blank': True,
                'default': ''
            }
        }

    def validate(self, data):
        # Set empty string if email not provided
        if 'email' not in data:
            data['email'] = ''
        return data
    
# class OrderSerializer(serializers.ModelSerializer):
#     order_items = OrderItemSerializer(many=True, required=False)
    

#     class Meta:
#         model = Order
#         fields = '__all__'

#     def create(self, validated_data):
#         order_items_data = validated_data.pop('order_items', [])
#         order = Order.objects.create(**validated_data)
        
#         for item_data in order_items_data:
#             OrderItem.objects.create(order=order, **item_data)
            
#         return order

    