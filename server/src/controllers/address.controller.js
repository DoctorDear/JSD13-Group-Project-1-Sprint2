import User from "../models/User.model.js";

export const addAddress = async (req, res, next) => {
  try {
    const {
      recipientName,
      phone,
      addressLine,
      province,
      district,
      subdistrict,
      postalCode,
      isDefault,
    } = req.body;

    if (!recipientName || !phone || !addressLine || !province || !postalCode) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide recipientName, phone, addressLine, province, and postalCode",
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
      ...(district ? { district: district.trim() } : {}),
      ...(subdistrict ? { subdistrict: subdistrict.trim() } : {}),
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
      (address) => address._id.toString() !== addressId,
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
      "district",
      "subdistrict",
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
