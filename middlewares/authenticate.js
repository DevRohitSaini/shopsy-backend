import jwt from "jsonwebtoken";
import Customer from "../models/Customer.js";

export default async function authenticate(req, res, next) {
  let token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Not authorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.customer = await Customer.findById(decoded.id);
    next();
  } catch {
    res.status(401).json({ message: "Token invalid or expired" });
  }
};
