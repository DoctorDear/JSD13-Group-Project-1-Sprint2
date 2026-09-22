import User from "../models/User.model.js"

// 1. GET /api/v1/users/cart - ดึงข้อมูลตะกร้าสินค้าพร้อม populate รายละเอียดสินค้า
export const getCart = async (req, res) => {
    try {
        const userId = req.user.id || req.user.userId; // ได้จาก verifyToken middleware
        const user = await User.findById(userId).populate('cart.productId');

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.status(200).json({
            success: true,
            cart: user.cart
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 2. POST /api/v1/users/cart - เพิ่มสินค้าลงตะกร้า (ถ้าซ้ำไซส์เดิมให้บวกทบจำนวน)
export const addToCart = async (req, res) => {
    try {
        const userId = req.user.userId
        const { productId, size, customName, customNumber, quantity, price } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // ตรวจสอบว่ามีสินค้า (productId) และไซส์ (size) เดียวกันอยู่ในตะกร้าแล้วหรือยัง
        // ตรวจสอบว่ามีสินค้าและไซส์เดียวกันอยู่ในตะกร้าแล้วหรือยัง (ป้องกัน item.productId เป็น null ด้วย)
        const existingItemIndex = user.cart.findIndex(
            (item) => item.productId && item.productId.toString() === productId && item.size === size
        );

        if (existingItemIndex > -1) {
            // หากพบสินค้าและไซส์ซ้ำกัน ให้บวกทบจำนวนเข้าไป
            user.cart[existingItemIndex].quantity += Number(quantity);
        } else {
            // หากไม่ซ้ำ ให้ push เพิ่มรายการใหม่เข้าไปใน array
            user.cart.push({
                productId: productId,
                size,
                customName,
                customNumber,
                quantity: Number(quantity),
                price: Number(price)
            });
        }

        await user.save();
        await user.populate('cart.productId');

        res.status(200).json({
            success: true,
            message: 'Added to cart successfully',
            cart: user.cart
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 3. PATCH /api/v1/users/cart/:itemId - อัปเดตจำนวนสินค้าตาม subdocument ID (ต้องไม่ต่ำกว่า 1)
export const updateCartItemQuantity = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { itemId } = req.params;
        const { quantity } = req.body;

        if (quantity < 1) {
            return res.status(400).json({ success: false, message: 'Quantity must be at least 1' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // ค้นหา item ใน subdocument array ด้วย id
        const cartItem = user.cart.id(itemId);
        if (!cartItem) {
            return res.status(404).json({ success: false, message: 'Cart item not found' });
        }

        cartItem.quantity = Number(quantity);
        await user.save();
        await user.populate('cart.productId');

        res.status(200).json({
            success: true,
            message: 'Cart item quantity updated',
            cart: user.cart
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 4. DELETE /api/v1/users/cart/:itemId - ลบสินค้าเฉพาะชิ้นนั้นออกจากตะกร้า
export const removeCartItem = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { itemId } = req.params;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // ใช้ pull เพื่อลบ subdocument ออกจาก array
        user.cart.pull({ _id: itemId });
        await user.save();
        await user.populate('cart.productId');

        res.status(200).json({
            success: true,
            message: 'Item removed from cart',
            cart: user.cart
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 5. DELETE /api/v1/users/cart - ล้างตะกร้าสินค้าทั้งหมดให้เป็น Array ว่าง
export const clearCart = async (req, res) => {
    try {
        const userId = req.user.userId;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        user.cart = [];
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Cart cleared successfully',
            cart: user.cart
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
