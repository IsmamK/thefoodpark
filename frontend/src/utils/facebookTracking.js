// src/utils/facebookTracking.js
import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL;

export const trackViewContent = async (product, user = null) => {
  try {
    const response = await axios.post(`${apiUrl}/track/view_content/`, {
      product: {
        id: product.id,
        title: product.title,
        price: product.price,
        user_email: user?.email,
        user_phone: user?.phone
      }
    });
    console.log('🎉 ViewContent tracked:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error tracking ViewContent:', error);
  }
};

export const trackAddToCart = async (product, quantity = 1, user = null) => {
  try {
    const response = await axios.post(`${apiUrl}/track/add_to_cart/`, {
      product: {
        id: product.id,
        title: product.title,
        price: product.price,
        quantity,
        user_email: user?.email,
        user_phone: user?.phone
      }
    });
    console.log('🛒 AddToCart tracked:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error tracking AddToCart:', error);
  }
};

export const trackCheckout = async (items, totalValue, user = null) => {
  try {
    const response = await axios.post(`${apiUrl}/track/checkout/`, {
      checkout: {
        items: items.map(item => ({
          id: item.id,
          price: item.price,
          quantity: item.quantity
        })),
        total_value: totalValue,
        user_email: user?.email,
        user_phone: user?.phone
      }
    });
    console.log('💰 Checkout tracked:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error tracking Checkout:', error);
  }
};

export const trackPurchase = async (orderId, items, totalValue, user = null) => {
  try {
    const response = await axios.post(`${apiUrl}/track/purchase/`, {
      purchase: {
        order_id: orderId,
        items: items.map(item => ({
          id: item.id,
          price: item.price,
          quantity: item.quantity
        })),
        value: totalValue,
        user_email: user?.email,
        user_phone: user?.phone
      }
    });
    console.log('✅ Purchase tracked:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error tracking Purchase:', error);
  }
};