import { useState } from 'react';
import { useCart } from '../hooks/useCart';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import axios from 'axios';

function Cart() {
  const { items, removeFromCart, clearCart } = useCart();
  const [processing, setProcessing] = useState(false);
  const stripe = useStripe();
  const elements = useElements();

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = async (e) => {
    e.preventDefault();
    setProcessing(true);

    try {
      // Create payment intent
      const { data: { clientSecret } } = await axios.post('http://localhost:3003/create-payment-intent', {
        amount: total
      });

      // Confirm payment
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (paymentIntent.status === 'succeeded') {
        // Create order
        await axios.post('http://localhost:3004/orders', {
          userId: localStorage.getItem('userId'),
          items: items.map(item => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price
          })),
          total
        });

        clearCart();
        alert('Order placed successfully!');
      }
    } catch (error) {
      console.error('Payment failed:', error);
      alert('Payment failed: ' + error.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div>
      <h2>Shopping Cart</h2>
      {items.map(item => (
        <div key={item.id} className="cart-item">
          <h3>{item.name}</h3>
          <p>Quantity: {item.quantity}</p>
          <p>Price: ${item.price * item.quantity}</p>
          <button onClick={() => removeFromCart(item.id)}>Remove</button>
        </div>
      ))}
      <div className="cart-total">
        <h3>Total: ${total}</h3>
      </div>
      <form onSubmit={handleCheckout}>
        <CardElement />
        <button type="submit" disabled={processing}>
          {processing ? 'Processing...' : 'Pay Now'}
        </button>
      </form>
    </div>
  );
}

export default Cart;
