import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

function Products() {
  const { data: products, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => axios.get('http://localhost:3002/products').then(res => res.data)
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h2>Products</h2>
      <div className="products-grid">
        {products?.map(product => (
          <div key={product.id} className="product-card">
            <h3>{product.name}</h3>
            <p>{product.description}</p>
            <p>${product.price}</p>
            <button>Add to Cart</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Products;
