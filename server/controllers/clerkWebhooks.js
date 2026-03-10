import User from "../models/User.js";
import { Webhook } from "svix";
import connectDB from "../configs/db.js";


const clerkWebhooks = async (req, res) => {
    await connectDB();   // ensure database is connected

    console.log(" Webhook request received");

  try {
        console.log("Webhook Secret:", process.env.CLERK_WEBOOK_SECRET ? "Loaded " : "Missing ");

    //cretae a svix instance with clerk webhook secret.
    const whook = new Webhook(process.env.CLERK_WEBOOK_SECRET);

    //Getting headers
    const headers = {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"],
    };
        console.log(" Webhook Headers:", headers);


    //verifying headers
    await whook.verify(JSON.stringify(req.body), headers);
    console.log("Webhook verified successfully");

    //getting data from request body
    const { data, type } = req.body;

        console.log(" Event Type:", type);
    console.log(" Clerk User ID:", data?.id);

    const userData = {
      _id: data.id,
      email: data.email_addresses[0].email_address,
      username: data.first_name + " " + data.last_name,
      image: data.image_url,
        role: "user",
  recentSearchedCities: [],
    };
        console.log(" Processed User Data:", userData);


    //switch case for different types of events
    switch (type) {
      case "user.created": {
          console.log("Creating user:", userData);

        await User.create(userData);
                console.log(" User successfully created:", newUser);

        break;
      }
      case "user.updated": {
                console.log(" Updating user:", data.id);

        await User.findByIdAndUpdate(data.id, userData);
                console.log(" User updated:", updatedUser);

        break;
      }
      case "user.deleted": {
        await User.findByIdAndDelete(data.id);
        break;
      }
      default:
        break;
    }
    res.json({ success: true, message: "Webhook received" });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

export default clerkWebhooks;
