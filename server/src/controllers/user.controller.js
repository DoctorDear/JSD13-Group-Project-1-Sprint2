import User from "../models/User.model.js";

export const getProfile = async (req, res, next) => {
	try {
		const user = await User.findById(req.user.userId).select("-password");

		if (!user) {
			return res
				.status(404)
				.json({ success: false, message: "User not found" });
		}

		return res.status(200).json({ success: true, user });
	} catch (err) {
		next(err);
	}
};

export const updateProfile = async (req, res, next) => {
	try {
		const { firstName, lastName, phone } = req.body;
		const updates = {};

		if (firstName !== undefined) updates.firstName = firstName.trim();
		if (lastName !== undefined) updates.lastName = lastName.trim();
		if (phone !== undefined) updates.phone = phone.trim();

		if (Object.keys(updates).length === 0) {
			return res.status(400).json({
				success: false,
				message: "Please provide firstName, lastName, or phone",
			});
		}

		const user = await User.findByIdAndUpdate(req.user.userId, updates, {
			new: true,
			runValidators: true,
		}).select("-password");

		if (!user) {
			return res
				.status(404)
				.json({ success: false, message: "User not found" });
		}

		return res.status(200).json({
			success: true,
			message: "Profile updated successfully",
			user,
		});
	} catch (err) {
		next(err);
	}
};
