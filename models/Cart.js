import mongoose from "mongoose";

const CartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  guestCartId: { type: String, default: null },

  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product",required: true },
      quantity: { type: Number, default: 1, required: true }
    }
  ],

  createdAt: { type: Date, default: Date.now }
});

CartSchema.pre(/^find/, function (next) {
  this.populate("items.productId", "name price image");
  next();
});

export default mongoose.model("Cart", CartSchema);
