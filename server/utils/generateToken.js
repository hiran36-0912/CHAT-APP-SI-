import jwt from "jsonwebtoken";

export const generateToken = (userId, res) => {
  const secret = process.env.JWT_SECRET || "default_jwt_secret_dev_only_change_in_production";
  const token = jwt.sign({ userId }, secret, {
    expiresIn: "7d",
  });

  if (res) {
    res.cookie("jwt", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
    });
  }

  return token;
};
