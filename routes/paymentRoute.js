const express=require('express');
const stripe=require('stripe');


const router=express.Router();
const stripeHandler=new stripe(process.env.STRIPE_SECRET_KEY);


router.post('/',async(req,res)=>{
    const {userId,vehicleId,currency,image,make,model}=req.body;
    console.log(image);
  const  line_items ={
    price_data: {
      currency: currency,
      product_data:{name:`${make} ${model}`,images:[image]},
      unit_amount:  2000,
    },
    quantity: 1,
  };

  try {
    const session = await stripeHandler.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [line_items], 
      mode: 'payment',
      metadata: {
      vehicleId: vehicleId.toString(),
      userId: userId.toString(),
    },
      success_url: `http://localhost:3000/success`,
      cancel_url: 'http://localhost:3000/cancel',
    });

    res.json({ id: session.id,url: session.url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
})

router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // ✅ Payment successful
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      const vehicleId = session.metadata.vehicleId;

      console.log("Payment successful for order: ",vehicleId);
    }

    res.json({ received: true });
  }
);

module.exports=router;