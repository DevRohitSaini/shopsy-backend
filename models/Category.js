import mongoose from "mongoose";
import {slugify} from "../config/utills.js";

const categorySchema = new mongoose.Schema(
  {
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
    image: {
      type: String,
      required: true,
    },
    color: {
      type: String,
      default: null,
    }
  },
  { timestamps: true }
);

categorySchema.pre("save", async function (next) {
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

export default mongoose.model("Category", categorySchema);
