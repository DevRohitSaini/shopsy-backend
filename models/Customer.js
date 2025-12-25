import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const customerSchema = new mongoose.Schema(
  {
    displayName:{
      type: String,
    },
    firstName: {
      type: String,
    },
    lastName: {
      type: String,
      default: ""
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true
    },
    phone: {
      type: String,
    },
    street: {
      type: String,
      default: ""
    },
    city: {
      type: String,
      default: ""
    },    
    postcode: {
      type: String,
      default: ""
    },
    state: {
      type: String,
      default: ""
    },
    county: {
      type: String,
      default: "India"
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active"
    },
  },
  { timestamps: true }
);

// Strip out password field when sending user object to client
customerSchema.set('toJSON', {
  virtuals: true,
  transform(doc, obj) {
    obj.id = obj._id;
    delete obj.__v;
    delete obj.password;
    return obj;
  },
});

//Validate password field
customerSchema.path('password').validate(function (password) {
  return password.length >= 6 && password.match(/\d+/g);
}, 'Password be at least 6 characters long and contain 1 number.');

customerSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  
  this.password = await bcrypt.hash(this.password, 10);
});

// match password method
customerSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

// Generates a JSON Web token used for route authentication
customerSchema.methods.generateToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      customerLogin: true
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}


const Customer = mongoose.model("Customer", customerSchema);

export default Customer;
