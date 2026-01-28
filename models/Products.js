// models/Product.js
import mongoose from "mongoose";
import { slugify } from "../config/utills.js";

const productsSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      index: true,
    },
    price: {
      type: Number,
      required: true,
    },
    category: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Category",
      required: true
    },
    image: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    rating: {
      type: Number,
      default: 0,
    },
    stock: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

productsSchema.pre("save", async function (next) {
  if (!this.isModified("name")) return;

  const Product = this.constructor;
  let baseSlug = slugify(this.name);
  let slug = baseSlug;
  let count = 1;

  // Ensure uniqueness
  while (await Product.exists({ slug })) {
    slug = `${baseSlug}-${count++}`;
  }

  this.slug = slug;
});


export default mongoose.model("Product", productsSchema);
