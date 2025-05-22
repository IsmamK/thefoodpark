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



class OrderSerializer(serializers.ModelSerializer):
    order_items = OrderItemSerializer(many=True, required=False)
    discount = DiscountSerializer(read_only=True)
    discount_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    order_time = serializers.SerializerMethodField()
    
    class Meta:
        model = Order
        fields = "__all__"
    
    def create(self, validated_data):
        order_items_data = validated_data.pop('order_items', [])
        order = Order.objects.create(**validated_data)
        
        for item_data in order_items_data:
            # Ensure we're using the product ID, not the object
            OrderItem.objects.create(
                order=order,
                product_id=item_data['product'].id if hasattr(item_data['product'], 'id') else item_data['product'],
                quantity=item_data['quantity']
            )
            
        return order
    
    def get_order_time(self, obj):
        return obj.order_time.strftime('%d %b %Y, %I:%M %p')
    
   
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

    