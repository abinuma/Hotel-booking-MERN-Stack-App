//Get/api/user

export const getUserData = async (req, res) => {
  try {
    const role = req.user.role;
    const recentSearchdCities = req.user.recentSearchdCities;
    res.json({ success: true, role, recentSearchdCities });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

//store user recent searched cities
export const storeRecentSearchedCities = async (req, res) => {
  try {
    const { recentSearchdCities } = req.body;
    const user = await req.user;
    if (user.recentSearchdCities.length < 3) {
      user.recentSearchdCities.push(recentSearchdCities);
    } else {
      user.recentSearchdCities.shift();
      user.recentSearchdCities.push(recentSearchdCities);
    }
    await user.save();
    res.json({ success: true, message: "City added" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
