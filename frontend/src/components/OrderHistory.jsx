import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

function OrderHistory() {
  const { data: orders, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: () => axios.get(`http://localhost:3004/orders/${localStorage.getItem('userId')}`)
      .then(res => res.data)
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h2>Order History</h2>
      {orders?.map(order => (
        <div key={order.id} className="order-card">
          <h3>Order #{order.id}</h3>
          <p>Status: {order.status}</p>
          <p>Total: ${order.total}</p>
          <div className="order-items">
            {order.items.map((item, index) => (
              <div key={index} className="order-item">
                <p>Product ID: {item.product_id}</p>
                <p>Quantity: {item.quantity}</p>
                <p>Price: ${item.price}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default OrderHistory;
