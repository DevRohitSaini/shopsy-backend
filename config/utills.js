import mongoose from 'mongoose';

function generateCacheKey(req) {
    const baseUrl = req.path.replace(/^\/+|\/+$/g, '').replace(/\//g, ':');
    const params = req.query;
    const sortedParams = Object.keys(params)
        .sort()
        .map((key) => `${key}=${params[key]}`)
        .join('&');

    return sortedParams ? `${baseUrl}:${sortedParams}` : baseUrl;
}

const authMiddleware = (req, res, next) => {
  // If user logged-in from session/JWT
  if (req.user) return next();

  // Else detect guest cartId from headers or cookies
  if (!req.headers["guest-cart-id"]) {
    return res.status(401).json({ message: "No user or guest cart provided" });
  }

  req.guestCartId = req.headers["guest-cart-id"];
  next();
};

function slugify(text) {
  return text
    .normalize("NFD")                  // Split accented characters
    .replace(/[\u0300-\u036f]/g, '')   // Remove accents
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')       // Replace non-alphanumeric with -
    .replace(/^-+|-+$/g, '');          // Remove leading/trailing -
}

function generateOrderID() {
  const now = new Date();
  const year = now.getFullYear();
  const random = Math.floor(100000 + Math.random() * 900000);
  return `ORD${year}${random}`;
};

/**
 * Check if MongoDB supports transactions
 */
function isTransactionSupported (){
  const topology = mongoose.connection?.client?.topology?.description;
  return topology && topology.type !== "Single";
};

/**
 * Run function with or without transaction
 */
async function runWithTransaction(callback){
  if (!isTransactionSupported()) {
    // ❌ No transactions supported
    return await callback(null);
  }

  // ✅ Transactions supported
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const result = await callback(session);
    await session.commitTransaction();
    return result;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};
export { generateCacheKey, authMiddleware, slugify, generateOrderID, runWithTransaction };