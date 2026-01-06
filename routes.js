import { Router } from 'express';
import authRoute from "./routes/authRoutes.js";
import categoryRoute from "./routes/categoryRoute.js";
import productRoute from "./routes/productRoute.js";
import cartRoute from "./routes/cartRoute.js";
import wishlistRoute from "./routes/wishlistRoute.js";
import customerRoutes from "./routes/customerRoutes.js";

const routes = new Router();

routes.get("/", (req, res) => {
  res.send("API is running...");
});

routes.use("/auth", authRoute);

routes.use("/categories", categoryRoute);
routes.use("/products", productRoute);
routes.use("/carts", cartRoute);
routes.use("/wishlist", wishlistRoute);

routes.use("/customers", customerRoutes);

export default routes;