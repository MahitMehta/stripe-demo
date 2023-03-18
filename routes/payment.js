const express = require('express');
const Stripe = require('stripe');
require('dotenv').config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", null);

const app = express();
app.use(express.json());

const target = 10000; // Target funding amount in paisa (Rs 10000)
const deadline = 600000; // Deadline in milliseconds (10 minutes)

let totalAmount = 0; // Total amount pledged so far in paisa

app.post('/donate', async (req, res) => {
  const { token = {}, amount = 0 } = req.body; 

  if (!Object.keys(token).length || !amount) {
    res.status(400).json({ success: false, message: "Invalid token or amount" });
    return;
  }

  const { id: customerId } = await stripe.customers.create({
    email: token.email,
    source: token.id, 
  }).catch(e => {
    console.log(e);
    res.status(500).json({ success: false, message: "Failed to create customer" });
    return null; 
  });

  if (!customerId) {
    res.status(500).json({ success: false, message: "Failed to create customer" });
    return; 
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount,
    currency: 'inr',
    payment_method_types: ['card'],
    customer: customerId,
    capture_method: 'manual',
    description: 'Funding Campaign Charge'
  }).catch(e => {
    console.log(e);
    res.status(500).json({ success: false, message: "Failed to create payment intent" });
    return null; 
  });

  if (!paymentIntent) {
    res.status(500).json({ success: false, message: "Failed to create payment intent" });
    return;
  }

  totalAmount += amount;
  res.status(201).json({ success: true, message: "Payment succeeded" });
});

const capturePaymentAfterDeadline = async () => {
  if (totalAmount >= target) {
    // Capture payments for successful campaign
    const paymentIntents = await stripe.paymentIntents.list({ limit: 100 });

    paymentIntents.data.forEach(async (paymentIntent) => {
      if (paymentIntent.status === 'requires_capture') {
        await stripe.paymentIntents.capture(paymentIntent.id).catch(e => console.log(e));
      }
    });

    console.log("All payments successfully captured.");
  } else {
    // Cancel payments for failed campaign
    const paymentIntents = await stripe.paymentIntents.list({ limit: 100 });

    paymentIntents.data.forEach(async (paymentIntent) => {
      if (paymentIntent.status === 'requires_capture') {
        await stripe.paymentIntents.cancel(paymentIntent.id).catch(e => console.log(e));
      }
    });

    console.log("All payments successfully cancelled.");
  }
};

// Set a timer to capture payments after the deadline
setTimeout(capturePaymentAfterDeadline, deadline);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
