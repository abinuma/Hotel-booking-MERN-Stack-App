import { clerkClient } from "@clerk/express";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    let userId;

    if (typeof req.auth === "function") {
      const authObj = await req.auth();
      userId = authObj?.userId;
    } else {
      userId = req.auth?.userId;
    }

    if (!userId) {
      return res.json({ success: false, message: "Not authenticated" });
    }

    let user = await User.findById(userId);

    // If user doesn't exist → fetch real data from Clerk
    if (!user) {
      const clerkUser = await clerkClient.users.getUser(userId);

      user = await User.create({
        _id: userId,
        username:
          clerkUser.username ||
          `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`,
        email: clerkUser.emailAddresses[0].emailAddress,
        image: clerkUser.imageUrl,
        role: "user",
        recentSearchedCities: [],
      });
    }

    req.user = user;

    next();
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// export const protect = async (req,res,next) => {
//   const{userId} = req.auth;
//   if(!userId){
//     res.json({success:false,message:"Not authenticated"});
//   }else{
//     const user = await User.findById(userId);
//     req.user = user;
//     next();
//   }
// }
