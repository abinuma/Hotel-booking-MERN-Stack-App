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
  console.log("🟡 WEBHOOK HIT");

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

  console.log("🟢 Event Type:", event.type);

  // 🔥 CASE 1: checkout.session.completed
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    console.log("🟣 SESSION:", session);

    const bookingId = session.metadata?.bookingId;

    console.log("✅ BookingId from session:", bookingId);

    if (bookingId) {
      await Booking.findByIdAndUpdate(bookingId, {
        isPaid: true,
        paymentMethod: "Stripe",
      });
      console.log("✅ DB UPDATED via session");
    } else {
      console.log("❌ bookingId missing in session metadata");
    }
  }

  // 🔥 CASE 2: payment_intent.succeeded
  else if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;

    console.log("🟣 PAYMENT INTENT:", paymentIntent);

    // metadata may be here
    const bookingId = paymentIntent.metadata?.bookingId;

    console.log("✅ BookingId from paymentIntent:", bookingId);

    if (bookingId) {
      await Booking.findByIdAndUpdate(bookingId, {
        isPaid: true,
        paymentMethod: "Stripe",
      });
      console.log("✅ DB UPDATED via paymentIntent");
    } else {
      console.log("❌ bookingId missing in paymentIntent metadata");
    }
  }

  else {
    console.log(`⚠️ Unhandled event type ${event.type}`);
  }

  response.json({ received: true });
};