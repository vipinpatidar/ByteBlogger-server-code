import Stripe from "stripe";

const stripe = Stripe(process.env.STRIPE_KEY);

export const postStipeCharges = async (req, res) => {
  try {
    const stripeResponse = await stripe.paymentIntents.create({
      amount: req.body.amount,
      currency: "inr",
      description: "test payment of blogging app",
      shipping: {
        name: "Vipin Patidar",
        address: {
          line1: "Patidar mahoola",
          postal_code: "98140",
          city: "Jaipur",
          state: "Rajasthan",
          country: "India",
        },
      },
      automatic_payment_methods: { enabled: true },
    });

    // console.log(stripeResponse);

    res.status(200).json(stripeResponse.client_secret);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
