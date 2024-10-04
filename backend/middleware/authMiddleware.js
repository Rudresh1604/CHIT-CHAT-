const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const protect = async (req, res, next) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    let token;
    try {
      // console.log(token);

      token = req.headers.authorization.split(" ")[1];

      // decode token id
      const decoded = jwt.verify(token, process.env.JWT_KEY);
      // console.log(decoded);

      // get user from token exclude password
      req.user = await User.findById(decoded.userId).select("-password");
      // console.log(req.user);

      next();
    } catch (error) {
      console.log(error);
      res.status(401).send("Not authorized , token failed");
    }
    if (!token) {
      res.status(401);
      res.json("Not authorzed, no token");
    }
  }
};

module.exports = protect;
