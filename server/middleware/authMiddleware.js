import User from "../models/User.js";

//middleware to check if user is authenticated
export const protect = async (req,res,next) => {
  try {
    console.log("AUTH:", req.auth);

    // Get userId from Clerk auth function
    let userId;

    if (typeof req.auth === "function") {
      // Some Clerk versions: req.auth() returns { userId }
      const authObj = await req.auth();
      console.log("AUTH OBJECT FROM FUNCTION:", authObj);
      userId = authObj?.userId;
    } else {
      // fallback: req.auth.userId
      userId = req.auth?.userId;
    }

    if (!userId) {
       return res.json({success:false,message:"Not authenticated"});
    }

    const user = await User.findById(userId);

    if (!user) {
       return res.json({success:false,message:"User not found"});
    }

     req.user = user;

    next();
  } catch (error) {
     res.json({success:false,message:error.message});
  }
};
