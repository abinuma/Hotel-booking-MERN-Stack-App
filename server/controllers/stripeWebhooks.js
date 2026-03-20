import Stripe from "stripe";
import Booking from "../models/Booking.js";
//  API to handle Stripe webhooks

// export const stripeWebhooks = async (request,response) => {
//     // Stripe gateway intialize

//     const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
//     const sig = request.headers['stripe-signature'];
//     let event;
//     try {
//         event = stripeInstance.webhooks.constructEvent(request.body, sig, process.env.STRIPE_WEBHOOK_SECRET)
//     } catch (error) {
//         response.status(400).send(`Webhook Error: ${error.message}`);
//     }
//     // Handle the event
//     // payment_intent.succeeded
//     if (event.type === 'checkout.session.completed' ) {
//         const paymentIntent = event.data.object;
//         const paymentIntentId = paymentIntent.id;

//         // getting session metadata
//         // const session = await stripeInstance.checkout.sessions.list({paymentIntent: paymentIntentId});

//         const {bookingId} = session.data[0].metadata;

//         // mark payment as paid
//         await Booking.findByIdAndUpdate(bookingId, { isPaid: true, paymentMethod: "Stripe" });

//     }else{
//         console.log(`Unhandled event type ${event.type}`);
//     }
//     response.json({ received: true });
// }

export const stripeWebhooks = async (request, response) => {
  const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
  const sig = request.headers['stripe-signature'];

  let event;

  try {
    event = stripeInstance.webhooks.constructEvent(
      request.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    console.log("❌ Webhook Error:", error.message);
    return response.status(400).send(`Webhook Error: ${error.message}`);
  }

  // ✅ correct event
  if (event.type === 'checkout.session.completed') {

    const session = event.data.object; // ✅ THIS IS THE SESSION

    const { bookingId } = session.metadata;

    console.log("✅ Payment success for booking:", bookingId);

    // ✅ update DB
    await Booking.findByIdAndUpdate(bookingId, {
      isPaid: true,
      paymentMethod: "Stripe"
    });

  } else {
    console.log(`Unhandled event type ${event.type}`);
  }

  response.json({ received: true });
};