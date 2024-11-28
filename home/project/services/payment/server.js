import express from 'express';
import cors from 'cors';

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Simplified payment processing for demo
app.post('/create-payment-intent', async (req, res) => {
  const { amount } = req.body;
  
  try {
    // Simulate payment processing
    const paymentIntent = {
      id: 'pi_' + Math.random().toString(36).substr(2, 9),
      amount: amount,
      currency: 'usd',
      status: 'succeeded',
      client_secret: 'sk_test_' + Math.random().toString(36).substr(2, 9)
    };

    res.json({ 
      clientSecret: paymentIntent.client_secret,
      amount: amount,
      status: paymentIntent.status
    });
  } catch (error) {
    res.status(500).json({ error: 'Payment processing failed' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

app.listen(3003, () => console.log('Payment service running on port 3003'));
