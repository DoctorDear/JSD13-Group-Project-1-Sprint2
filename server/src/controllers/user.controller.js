import User from "../models/User.model.js";

const validateProfileUpdate = (payload = {}) => {
	const errors = [];
	const { firstName, lastName, phone } = payload;
	const updates = {};

	if (firstName !== undefined) {
		const value = typeof firstName === "string" ? firstName.trim() : "";
		if (!value) {
			errors.push("firstName cannot be empty");
		} else if (value.length < 2) {
			errors.push("firstName must be at least 2 characters");
		} else {
			updates.firstName = value;
		}
	}

	if (lastName !== undefined) {
		const value = typeof lastName === "string" ? lastName.trim() : "";
		if (!value) {
			errors.push("lastName cannot be empty");
		} else if (value.length < 2) {
			errors.push("lastName must be at least 2 characters");
		} else {
			updates.lastName = value;
		}
	}

	if (phone !== undefined) {
		const value = typeof phone === "string" ? phone.trim() : "";
		if (!value) {
			errors.push("phone cannot be empty");
		} else {
			const digitsOnly = value.replace(/\D/g, "");
			if (digitsOnly.length < 9 || digitsOnly.length > 15) {
				errors.push("phone must be a valid phone number");
			} else {
				updates.phone = value;
			}
		}
	}

	if (Object.keys(updates).length === 0) {
		errors.unshift("Please provide at least one valid field to update");
	}

	return { errors, updates };
};

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
		const { address, ...profilePayload } = req.body;
		const { errors, updates } = validateProfileUpdate(profilePayload);

		if (
			address !== undefined &&
			errors.length === 1 &&
			errors[0] === "Please provide at least one valid field to update"
		) {
			errors.length = 0;
		}

		if (address !== undefined) {
			if (!address || typeof address !== "object" || Array.isArray(address)) {
				errors.push("address must be an object");
			} else {
				const addressFields = [
					"recipientName",
					"phone",
					"addressLine",
					"province",
					"postalCode",
				];
				for (const field of addressFields) {
					if (address[field] !== undefined) {
						const value = String(address[field]).trim();
						if (!value) errors.push(`${field} cannot be empty`);
					}
				}
			}
		}

		if (errors.length > 0) {
			return res.status(400).json({
				success: false,
				message: errors[0],
				errors,
			});
		}

		const user = await User.findById(req.user.userId);

		if (!user) {
			return res
				.status(404)
				.json({ success: false, message: "User not found" });
		}

		Object.assign(user, updates);

		if (address !== undefined) {
			const addressUpdates = {};
			for (const field of [
				"recipientName",
				"phone",
				"addressLine",
				"province",
				"postalCode",
			]) {
				if (address[field] !== undefined) {
					addressUpdates[field] = String(address[field]).trim();
				}
			}

			const defaultAddress = user.addresses.find((item) => item.isDefault);
			if (defaultAddress) {
				Object.assign(defaultAddress, addressUpdates);
			} else {
				const requiredAddressFields = [
					"recipientName",
					"phone",
					"addressLine",
					"province",
					"postalCode",
				];
				const hasAllAddressFields = requiredAddressFields.every(
					(field) => addressUpdates[field],
				);

				if (!hasAllAddressFields) {
					return res.status(400).json({
						success: false,
						message:
							"A complete address is required when the user has no default address",
					});
				}

				user.addresses.push({ ...addressUpdates, isDefault: true });
			}
		}

		await user.save();
		const responseUser = user.toObject();
		delete responseUser.password;

		return res.status(200).json({
			success: true,
			message: "Profile updated successfully",
			user: responseUser,
		});
	} catch (err) {
		next(err);
	}
};

export const addAddress = async (req, res, next) => {
  try {
    const {
      recipientName,
      phone,
      addressLine,
      province,
      postalCode,
      isDefault,
    } = req.body;

    if (!recipientName || !phone || !addressLine || !province || !postalCode) {
      return res.status(400).json({
        success: false,
        message: "Please provide recipientName, phone, addressLine, province, and postalCode",
      });
    }

    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const newAddress = {
      recipientName: recipientName.trim(),
      phone: phone.trim(),
      addressLine: addressLine.trim(),
      province: province.trim(),
      postalCode: postalCode.trim(),
      isDefault: Boolean(isDefault),
    };

    // ถ้ามี isDefault = true ให้ตั้ง default ให้เฉพาะอันนี้
    if (newAddress.isDefault) {
      user.addresses = user.addresses.map((addr) => ({
        ...addr.toObject(),
        isDefault: false,
      }));
    }

    user.addresses.push(newAddress);

    await user.save();

    return res.status(201).json({
      success: true,
      message: "Address added successfully",
      addresses: user.addresses,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteAddress = async (req, res, next) => {
  try {
    const { addressId } = req.params;

    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const originalLength = user.addresses.length;

    user.addresses = user.addresses.filter(
      (address) => address._id.toString() !== addressId
    );

    if (user.addresses.length === originalLength) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Address deleted successfully",
      addresses: user.addresses,
    });
  } catch (err) {
    next(err);
  }
};

export const updateAddress = async (req, res, next) => {
	try {
		const allowedFields = [
			"recipientName",
			"phone",
			"addressLine",
			"province",
			"postalCode",
			"isDefault",
		];
		const updates = {};

		for (const field of allowedFields) {
			if (req.body[field] !== undefined) {
				updates[field] =
					typeof req.body[field] === "string"
						? req.body[field].trim()
						: req.body[field];
			}
		}

		const requiredFields = [
			"recipientName",
			"phone",
			"addressLine",
			"province",
			"postalCode",
		];
		const hasEmptyField = requiredFields.some(
			(field) => updates[field] !== undefined && !updates[field],
		);

		if (hasEmptyField || Object.keys(updates).length === 0) {
			return res.status(400).json({
				success: false,
				message: "Please provide valid address fields to update",
			});
		}

		const user = await User.findById(req.user.userId);

		if (!user) {
			return res.status(404).json({
				success: false,
				message: "User not found",
			});
		}

		const address = user.addresses.id(req.params.addressId);

		if (!address) {
			return res.status(404).json({
				success: false,
				message: "Address not found",
			});
		}

		if (updates.isDefault === true) {
			user.addresses.forEach((item) => {
				item.isDefault = item._id.equals(address._id);
			});
		}

		Object.assign(address, updates);
		await user.save();

		return res.status(200).json({
			success: true,
			message: "Address updated successfully",
			address,
			addresses: user.addresses,
		});
	} catch (err) {
		next(err);
	}
};
