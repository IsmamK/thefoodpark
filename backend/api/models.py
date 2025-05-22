from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class Category(models.Model):
    name = models.CharField(max_length=255)
    is_active = models.BooleanField(default=True)
    priority = models.IntegerField()
    image = models.ImageField(null=True,blank=True)
    description = models.TextField(null=True,blank=True)
    cover = models.ImageField(null=True,blank=True)
    feature_label = models.CharField(max_length=255, null=True, blank=True)  # New field for feature label
    def __str__(self):
        return f"{self.id} : {self.name}"

class SubCategory(models.Model):
    name = models.CharField(max_length=255)
    parent_category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name="subcategories")
    is_active = models.BooleanField(default=True)
    priority = models.IntegerField()

    def __str__(self):
        return f"{self.id} : {self.name}"

class Product(models.Model):
    title = models.CharField(max_length=255)
    price = models.DecimalField(decimal_places=2, max_digits=10)
    description = models.TextField()
    image = models.ImageField(upload_to='products/')
    sub_category = models.ForeignKey(SubCategory, on_delete=models.CASCADE, related_name="products")
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    is_bestseller = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.id} {self.title} (Price = {self.price})"

class Discount(models.Model):
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=50, blank=True, null=True)  # Discount code, if applicable
    amount = models.DecimalField(decimal_places=2, max_digits=10)
    is_percentage = models.BooleanField(default=True)  # True if the discount is a percentage, False if it's a flat amount
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    categories = models.ManyToManyField(Category, blank=True, related_name="discounts")
    subcategories = models.ManyToManyField(SubCategory, blank=True, related_name="discounts")
    products = models.ManyToManyField(Product, blank=True, related_name="discounts")
    is_auto_apply = models.BooleanField(default=False)  # True if discount is automatically applied, False if it requires a code

    def __str__(self):
        return f"{self.name} ({self.amount}{'%' if self.is_percentage else ''})"

class Order(models.Model):
    name = models.CharField(max_length=255)
    order_time = models.DateTimeField(auto_now_add=True)
    shipping_address = models.CharField(max_length=512)
    phone_number = models.CharField(max_length=20)
    discount = models.ForeignKey(Discount, on_delete=models.SET_NULL, null=True, blank=True)
    subtotal = models.DecimalField(decimal_places=2, max_digits=20)
    grandtotal = models.DecimalField(decimal_places=2, max_digits=20)
    STATUS_CHOICES = [
        ('checkout', 'Checkout'),
        ('placed', 'Placed'),
        ('processing', 'Processing'),
        ('shipped', 'Shipped'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='placed')
    client_ip_address = models.GenericIPAddressField(null=True, blank=True)  # Added IP address field

    def __str__(self):
        return f"Order Id: {self.id} , Customer: {self.name}"

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="order_items")
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="order_items")
    quantity = models.PositiveIntegerField(default=1)
    
    def __str__(self):
        return f"{self.quantity} x {self.product.title}"

class Banner(models.Model):
    active = models.BooleanField(default=True)
    image = models.ImageField(upload_to='banners/')

    def __str__(self):
        return f"Banner {self.id} - {'Active' if self.active else 'Inactive'}"
