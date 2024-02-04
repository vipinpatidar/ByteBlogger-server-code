import Stripe from "stripe";

const stripe = Stripe(
  "sk_test_51NxkghSFVsf2tYsVsfSy8UdQ3bzbUICvDN2ib0qIfUIcHLmjtQaFT6LFIX8fWySG87HMvtuSJVELWi5vPtJH9Txz00j7GacYBN"
);

export const postStipeCharges = async (req, res) => {
  try {
    const stripeResponse = await stripe.paymentIntents.create({
      amount: req.body.amount,
      currency: "inr",
      automatic_payment_methods: { enabled: true },
    });

    // console.log(stripeResponse);

    res.status(200).json(stripeResponse.client_secret);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
