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


export { generateCacheKey, authMiddleware, slugify };