import Stripe from "stripe";
import Booking from "../models/Booking.js";
//  API to handle Stripe webhooks

export const stripeWebhooks = async (request,response) => {
    // Stripe gateway intialize

    const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
    const sig = request.headers['stripe-signature'];
    let event;
    try {
        event = stripeInstance.webhooks.constructEvent(request.body, sig, process.env.STRIPE_WEBHOOK_SECRET)
    } catch (error) {
        response.status(400).send(`Webhook Error: ${error.message}`);
    }
    // Handle the event
    if (event.type === 'checkout.session.completed' ) {
            const session = event.data.object;

        // const paymentIntent = event.data.object;
        // const paymentIntentId = paymentIntent.id;

        // getting session metadata
        // const session = await stripeInstance.checkout.sessions.list({paymentIntent: paymentIntentId});

        const {bookingId} = session.metadata;
            console.log("✅ Payment success for:", bookingId);


        // mark payment as paid
        await Booking.findByIdAndUpdate(bookingId, { isPaid: true, paymentMethod: "Stripe" });

    }else{
        console.log(`Unhandled event type ${event.type}`);
    }
    response.json({ received: true });
}