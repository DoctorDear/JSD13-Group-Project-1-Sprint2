import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
	let token = null;

	if (req.cookies?.accessToken) {
		token = req.cookies.accessToken;
	} else if (req.headers.authorization?.startsWith("Bearer ")) {
		token = req.headers.authorization.split(" ")[1];
	}

	if (!token) {
		return res.status(401).json({
			success: false,
			message: "Access denied, no token provided",
		});
	}

	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		req.user = decoded;
		return next();
	} catch (err) {
		return res.status(401).json({
			success: false,
			message: "Invalid or expired token",
		});
	}
};
