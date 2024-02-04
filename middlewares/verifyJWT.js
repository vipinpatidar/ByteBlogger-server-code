import jwt from "jsonwebtoken";

export const verifyJWT = async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new Error("Unauthorized action.");
    }

    const decoded = await jwt.verify(token, process.env.SECRET_KEY);

    if (!decoded) {
      throw new Error("UnAuthenticated action");
    }

    req.userId = decoded.userId;
    req.isAdmin = decoded?.isAdmin;
    req.isEditor = decoded?.isEditor;

    next();
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};
