from django.urls import path
from . import views

app_name = 'api'

urlpatterns = [

    # ---------------------------------------  General Paths    --------------------------------------- 

    # categories
    path('categories/', views.Categories.as_view(), name='categories'),
    path('categories/<int:pk>/', views.Category.as_view(), name='category'),

    #banners

    path('banners/', views.BannerList.as_view(), name='banners'),
    path('banners/<int:pk>/', views.BannerRetrieve.as_view(), name='banner'),

    # subcategories
    path('subcategories/', views.Subcategories.as_view(), name='subcategories'),
    path('subcategories/<int:pk>', views.Subcategory.as_view(), name='subcategory'),


    # products
    path('products/', views.ProductListView.as_view(), name='products'),
    path('products/<int:pk>/', views.ProductDetailView.as_view(), name='product'),

    # orders
    path('orders/', views.AllOrders.as_view(), name='order-list'),
    path('orders/<int:pk>/', views.SingleOrder.as_view(), name='order-detail'),

     # order items
    path('order-items/', views.AllOrderItems.as_view(), name='orderitem-list'),
    path('order-items/<int:pk>/', views.SingleOrderItem.as_view(), name='orderitem-detail'),

    # discounts
    path('discounts/', views.AllDiscounts.as_view(), name='discount-list'),
    path('discounts/<int:pk>/', views.SingleDiscount.as_view(), name='discount-detail'),
    path('apply_discount/', views.ApplyDiscountView.as_view(), name='apply-discount'),
 





]
