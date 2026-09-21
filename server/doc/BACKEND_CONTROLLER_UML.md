# 🛠️ Backend Controllers Architecture & UML Specification
**Project:** Zeta (ζ) - Football Jersey E-Commerce Store  
**Stack:** Node.js, Express 5, MongoDB, Mongoose ODM, JWT, Bcrypt  
**Target:** JSD13 Group Project (Sprint 2 & Sprint 3)  
**Purpose:** เอกสารออกแบบระบบและไดอะแกรม UML สำหรับ Backend Controllers ทั้งหมด (Auth, User/Cart, Order, Product) เพื่อให้สมาชิกในทีมทุกคนที่เป็นมือใหม่สามารถเข้าใจภาพรวม Data Flow และการทำงานร่วมกันได้อย่างชัดเจน

---

## 📌 สารบัญ (Table of Contents)
1. [ภาพรวมสถาปัตยกรรม Backend (System Architecture)](#1-ภาพรวมสถาปัตยกรรม-backend-system-architecture)
2. [UML Class Diagram: Controllers & Middlewares](#2-uml-class-diagram-controllers--middlewares)
3. [UML Sequence Diagram 1: ระบบสมาชิกและความปลอดภัย (Auth Controller & Middleware)](#3-uml-sequence-diagram-1-ระบบสมาชิกและความปลอดภัย-auth-controller--middleware)
4. [UML Sequence Diagram 2: ระบบจัดการโปรไฟล์และตะกร้าสินค้า (User Controller)](#4-uml-sequence-diagram-2-ระบบจัดการโปรไฟล์และตะกร้าสินค้า-user-controller)
5. [UML Sequence Diagram 3: ระบบสั่งซื้อและเช็คเอาต์ (Order Controller - Checkout Flow)](#5-uml-sequence-diagram-3-ระบบสั่งซื้อและเช็คเอาต์-order-controller---checkout-flow)
6. [UML Sequence Diagram 4: ระบบค้นหาสินค้าและจัดการคลัง (Product Controller)](#6-uml-sequence-diagram-4-ระบบค้นหาสินค้าและจัดการคลัง-product-controller)
7. [API Endpoint Matrix (ตารางสรุป Route และ Controller)](#7-api-endpoint-matrix-ตารางสรุป-route-และ-controller)

---

## 1. ภาพรวมสถาปัตยกรรม Backend (System Architecture)

ระบบ Backend ของ Zeta ออกแบบตามรูปแบบ **Layered Architecture (MVC - Controller Layer)**:
1. **Routing Layer (`src/routes`)**: รับ HTTP Request จาก Client และแจกจ่ายไปยัง Endpoint ที่ถูกต้อง
2. **Middleware Layer (`src/middlewares`)**: ตรวจสอบความถูกต้องและสิทธิ์การใช้งาน (เช่น ตรวจสอบ JWT Token หรือตรวจ Role Admin)
3. **Controller Layer (`src/controllers`)**: จัดการ Business Logic, ตรวจสอบ Payload, เรียกใช้งาน Mongoose Model, และตอบกลับด้วย JSON Response หรือส่งต่อไปยัง Error Handler
4. **Model Layer (`src/models`)**: กำหนด Schema, Data Validation, และสื่อสารกับ MongoDB Atlas

```mermaid
graph LR
    subgraph Frontend ["Frontend (React App)"]
        UI["React Components / Pages"]
    end

    subgraph ExpressServer ["Express Server"]
        Router["Express Router (/api/v1)"]
        MW["Auth Middleware (verifyToken / checkAdmin)"]
        
        subgraph Controllers ["Controllers Layer"]
            AC["AuthController"]
            UC["UserController (Profile & Cart)"]
            OC["OrderController"]
            PC["ProductController"]
        end
        
        ErrorHandler["Global Error Handler (500)"]
    end

    subgraph Database ["Mongoose / MongoDB"]
        UM[("User Collection")]
        PM[("Product Collection")]
        OM[("Order Collection")]
    end

    UI -->|HTTP Request| Router
    Router --> MW
    MW -->|Authorized| Controllers
    MW -.->|Invalid Token 401| UI
    
    AC --> UM
    UC --> UM
    UC --> PM
    OC --> OM
    OC --> PM
    OC --> UM
    PC --> PM
    
    Controllers -->|Success 200/201| UI
    Controllers -.->|Error next(err)| ErrorHandler
    ErrorHandler -.->|500 JSON Response| UI
```

---

## 2. UML Class Diagram: Controllers & Middlewares

แผนภาพคลาสแสดงฟังก์ชัน (Methods) ในแต่ละ Controller, พารามิเตอร์ที่รับ (`req`, `res`, `next`), และความสัมพันธ์กับ Model ที่เกี่ยวข้อง

```mermaid
classDiagram
    direction TB

    class AuthMiddleware {
        +verifyToken(req, res, next) Promise~void~
        +requireAdmin(req, res, next) void
    }

    class AuthController {
        +register(req, res, next) Promise~Response~
        +login(req, res, next) Promise~Response~
        +getMe(req, res, next) Promise~Response~
    }

    class UserController {
        +getProfile(req, res, next) Promise~Response~
        +updateProfile(req, res, next) Promise~Response~
        +getCart(req, res, next) Promise~Response~
        +addToCart(req, res, next) Promise~Response~
        +updateCartItemQuantity(req, res, next) Promise~Response~
        +removeCartItem(req, res, next) Promise~Response~
        +clearCart(req, res, next) Promise~Response~
        +addAddress(req, res, next) Promise~Response~
        +deleteAddress(req, res, next) Promise~Response~
    }

    class OrderController {
        +createOrder(req, res, next) Promise~Response~
        +getMyOrders(req, res, next) Promise~Response~
        +getOrderById(req, res, next) Promise~Response~
        +getAllOrders(req, res, next) Promise~Response~
        +updateOrderStatus(req, res, next) Promise~Response~
    }

    class ProductController {
        +getProducts(req, res, next) Promise~Response~
        +getProductById(req, res, next) Promise~Response~
        +createProduct(req, res, next) Promise~Response~
        +updateProduct(req, res, next) Promise~Response~
        +deleteProduct(req, res, next) Promise~Response~
    }

    class UserModel {
        <<Mongoose Model>>
        +findOne(query)
        +findById(id)
        +create(data)
        +save()
    }

    class ProductModel {
        <<Mongoose Model>>
        +find(query)
        +findById(id)
        +create(data)
        +findByIdAndUpdate(id, data)
        +findByIdAndDelete(id)
    }

    class OrderModel {
        <<Mongoose Model>>
        +find(query)
        +findById(id)
        +create(data)
        +findByIdAndUpdate(id, data)
    }

    AuthMiddleware ..> AuthController : protects routes
    AuthMiddleware ..> UserController : protects routes
    AuthMiddleware ..> OrderController : protects routes
    AuthMiddleware ..> ProductController : protects admin CRUD

    AuthController --> UserModel : uses
    UserController --> UserModel : uses
    UserController ..> ProductModel : reads prices/stock
    OrderController --> OrderModel : uses
    OrderController ..> ProductModel : deducts stock
    OrderController ..> UserModel : clears cart
    ProductController --> ProductModel : uses
```

---

## 3. UML Sequence Diagram 1: ระบบสมาชิกและความปลอดภัย (Auth Controller & Middleware)

### 3.1 Sign Up (Register)
ลำดับขั้นตอนการสมัครสมาชิก: รับข้อมูล -> ตรวจสอบอีเมลซ้ำ -> แฮชรหัสผ่านด้วย `bcrypt` -> บันทึก User -> สร้าง JWT Token ส่งกลับ

```mermaid
sequenceDiagram
    autonumber
    actor Client as Frontend (K'Fon - Register Page)
    participant Route as Express Router (/api/v1/auth)
    participant Controller as AuthController.register
    participant Bcrypt as Bcrypt Utility
    participant DB as User Model (MongoDB)

    Client->>Route: POST /register (firstName, lastName, email, password, phone)
    Route->>Controller: register(req, res, next)
    
    Controller->>DB: User.findOne({ email })
    alt Email already exists
        DB-->>Controller: Found existing user
        Controller-->>Client: 400 Bad Request ("Email already registered")
    else Email is available
        DB-->>Controller: null
        Controller->>Bcrypt: bcrypt.hash(password, 10)
        Bcrypt-->>Controller: hashedPassword
        
        Controller->>DB: User.create({ ..., password: hashedPassword })
        DB-->>Controller: savedUser
        
        Note over Controller: สร้าง JWT Token (payload: userId, role)
        Controller-->>Client: 201 Created { message, token, user }
    end
```

### 3.2 Sign In (Login) & Token Verification (Auth Middleware)
ลำดับขั้นตอนการเข้าสู่ระบบ: หา User ตาม Email -> ตรวจสอบรหัสผ่าน -> สร้าง JWT Token -> และการใช้ Middleware คุ้มครอง Protected Route

```mermaid
sequenceDiagram
    autonumber
    actor Client as Frontend (Login / Protected Pages)
    participant Route as Express Router (/api/v1/auth)
    participant Controller as AuthController.login
    participant Middleware as AuthMiddleware.verifyToken
    participant DB as User Model (MongoDB)

    %% Login Flow
    Client->>Route: POST /login (email, password)
    Route->>Controller: login(req, res, next)
    Controller->>DB: User.findOne({ email })
    
    alt User Not Found OR Password Mismatch
        Controller-->>Client: 401 Unauthorized ("Invalid email or password")
    else Credentials Match
        Note over Controller: เปรียบเทียบ bcrypt.compare() สำเร็จ<br/>สร้าง JWT Token (expiresIn: "7d")
        Controller-->>Client: 200 OK { token, user: { _id, firstName, email, role } }
    end

    %% Protected Route Flow
    Note over Client, DB: ตัวอย่างเมื่อ Client เรียก Protected Route ในอนาคต
    Client->>Route: GET /api/v1/users/profile (Headers: Authorization: Bearer <token>)
    Route->>Middleware: verifyToken(req, res, next)
    
    alt Missing or Invalid Token
        Middleware-->>Client: 401 Unauthorized ("Token missing or invalid")
    else Token Valid
        Note over Middleware: ถอดรหัส JWT และฝากข้อมูลไว้ใน req.user = { userId, role }
        Middleware->>Route: next() (อนุญาตให้ทำงานต่อ)
    end
```

---

## 4. UML Sequence Diagram 2: ระบบจัดการโปรไฟล์และตะกร้าสินค้า (User Controller)

ในสถาปัตยกรรมของ Zeta: **ตะกร้าสินค้า (Cart)** ถูกเก็บเป็น Embedded Array Subdocument อยู่ใน `User` Collection เพื่อประสิทธิภาพในการดึงข้อมูล

### 4.1 การเพิ่มสินค้าลงตะกร้า (Add to Cart - Merge or Push)
เมื่อผู้ใช้กดเพิ่มสินค้า ระบบจะตรวจสอบว่า `productId` + `size` เดียวกันมีอยู่แล้วหรือไม่:
- ถ้ามีอยู่แล้ว -> **บวกทบจำนวน (`quantity += newQty`)**
- ถ้ายังไม่มี -> **เพิ่มรายการใหม่ลงใน Array (`cart.push(...)`)**

```mermaid
sequenceDiagram
    autonumber
    actor Client as Frontend (K'Dear - Product Detail)
    participant Route as Express Router (/api/v1/users)
    participant Middleware as AuthMiddleware.verifyToken
    participant Controller as UserController.addToCart
    participant DB as User Model (MongoDB)

    Client->>Route: POST /cart { productId, size, customName, customNumber, quantity, price }<br/>(Header: Bearer Token)
    Route->>Middleware: verifyToken(req, res, next)
    Middleware->>Controller: req.user.userId พร้อมใช้งาน
    
    Controller->>DB: User.findById(req.user.userId)
    DB-->>Controller: user document
    
    alt สินค้าและไซส์เดิมมีอยู่ใน user.cart แล้ว
        Note over Controller: หา index ของสินค้าด้วย productId + size<br/>user.cart[index].quantity += quantity
    else เป็นสินค้าหรือไซส์ใหม่
        Note over Controller: user.cart.push({ productId, size, customName, customNumber, quantity, price })
    end

    Controller->>DB: user.save()
    DB-->>Controller: updatedUser
    Controller-->>Client: 200 OK { message: "Item added to cart", cart: user.cart }
```

### 4.2 การดึงข้อมูลตะกร้า (Get Cart with Populate)
เพื่อแสดงผลชื่อเสื้อ, รูปภาพ, และราคาล่าสุดในหน้า Drawer/Cart ตะกร้าจะต้อง Populate รายละเอียดสินค้าจาก `Product` Collection

```mermaid
sequenceDiagram
    autonumber
    actor Client as Frontend (Cart Drawer / Cart Page)
    participant Route as Express Router (/api/v1/users)
    participant Middleware as AuthMiddleware.verifyToken
    participant Controller as UserController.getCart
    participant DB as User Model (MongoDB)

    Client->>Route: GET /cart (Header: Bearer Token)
    Route->>Middleware: verifyToken(req, res, next)
    Middleware->>Controller: req.user.userId
    
    Controller->>DB: User.findById(req.user.userId).populate('cart.productId')
    DB-->>Controller: user with populated cart items
    
    Controller-->>Client: 200 OK { cart: user.cart }
```

---

## 5. UML Sequence Diagram 3: ระบบสั่งซื้อและเช็คเอาต์ (Order Controller - Checkout Flow)

เมื่อผู้ใช้ทำการสั่งซื้อ (Checkout):
1. นำข้อมูลสินค้าในตะกร้ามาทำ **Snapshot** ลงใน `order.items` (เพื่อไม่ให้ประวัติสั่งซื้อเปลี่ยนหากราคาของสินค้าในระบบถูกแก้ภายหลัง)
2. ตัดยอดสต็อกคงเหลือใน `Product` Model (`quantity -= orderedQty`)
3. ล้างตะกร้าสินค้าของผู้ใช้ให้ว่างเปล่า (`user.cart = []`)
4. สร้างบันทึกการชำระเงินจำลอง (Simulated Payment)

```mermaid
sequenceDiagram
    autonumber
    actor Client as Frontend (K'Nick - Checkout Page)
    participant Route as Express Router (/api/v1/orders)
    participant Middleware as AuthMiddleware.verifyToken
    participant Controller as OrderController.createOrder
    participant OrderDB as Order Model (MongoDB)
    participant ProductDB as Product Model (MongoDB)
    participant UserDB as User Model (MongoDB)

    Client->>Route: POST /orders { items, shippingAddress, paymentMethod }<br/>(Header: Bearer Token)
    Route->>Middleware: verifyToken(req, res, next)
    Middleware->>Controller: req.user.userId
    
    Note over Controller: 1. สร้าง orderNumber อัตโนมัติ (เช่น "ZT-2026-XXXX")<br/>2. คำนวณ totalAmount จากรายการสินค้า
    
    loop ตรวจสอบและตัดสต็อกสินค้าทีละรายการ
        Controller->>ProductDB: Product.findByIdAndUpdate(item.productId, { $inc: { quantity: -item.quantity } })
        ProductDB-->>Controller: updated stock
    end

    Controller->>OrderDB: Order.create({ orderNumber, userId, items: snapshotItems, shippingAddress, payment: { method, status: 'completed' }, totalAmount })
    OrderDB-->>Controller: newOrder

    Note over Controller: 3. ล้างตะกร้าสินค้าของผู้ใช้
    Controller->>UserDB: User.findByIdAndUpdate(req.user.userId, { $set: { cart: [] } })
    UserDB-->>Controller: user cart cleared

    Controller-->>Client: 201 Created { message: "Order placed successfully", order: newOrder }
```

---

## 6. UML Sequence Diagram 4: ระบบค้นหาสินค้าและจัดการคลัง (Product Controller)

### 6.1 ดูรายละเอียดสินค้าพร้อม Variants (`getProductById`)
ดึงข้อมูลเสื้อตัวหลัก และดึงเสื้อรุ่นอื่นๆ ในคอลเลกชันเดียวกันผ่าน `groupId` (เช่น สลับดู Player Edition vs Stadium Edition)

```mermaid
sequenceDiagram
    autonumber
    actor Client as Frontend (Landing / Product Detail)
    participant Route as Express Router (/api/v1/products)
    participant Controller as ProductController.getProductById
    participant DB as Product Model (MongoDB)

    Client->>Route: GET /products/:id
    Route->>Controller: getProductById(req, res, next)
    
    Controller->>DB: Product.findById(req.params.id)
    alt Product Not Found
        DB-->>Controller: null
        Controller-->>Client: 404 Not Found { error: "Product not found" }
    else Product Found
        DB-->>Controller: productById
        opt ถ้าสินค้านี้มี groupId (เช่น เสื้อแข่งที่มีหลายรุ่น)
            Controller->>DB: Product.find({ groupId: productById.groupId })
            DB-->>Controller: variants list
        end
        Controller-->>Client: 200 OK { product: productById, variants }
    end
```

### 6.2 การจัดการสินค้าหลังบ้านโดย Admin (Create / Update / Delete)
การปกป้องเส้นทางด้วย Role-Based Access Control (`requireAdmin`)

```mermaid
sequenceDiagram
    autonumber
    actor AdminClient as Admin Dashboard (Frontend)
    participant Route as Express Router (/api/v1/products)
    participant AuthMW as AuthMiddleware.verifyToken
    participant AdminMW as AuthMiddleware.requireAdmin
    participant Controller as ProductController.createProduct
    participant DB as Product Model (MongoDB)

    AdminClient->>Route: POST /products { sku, name, price, quantity, tag, ... }<br/>(Header: Bearer Token)
    Route->>AuthMW: verifyToken(req, res, next)
    AuthMW->>AdminMW: next() -> req.user = { userId, role }
    
    alt req.user.role != 'admin'
        AdminMW-->>AdminClient: 403 Forbidden ("Admin access required")
    else req.user.role == 'admin'
        AdminMW->>Controller: next()
        Controller->>DB: Product.create(req.body)
        DB-->>Controller: newProduct
        Controller-->>AdminClient: 201 Created { message: "Product created", data: newProduct }
    end
```

---

## 7. API Endpoint Matrix (ตารางสรุป Route และ Controller)

ตารางนี้เป็น **Single Source of Truth** สำหรับทั้งฝั่ง Frontend และ Backend ในการเชื่อมต่อ API:

| หมวดหมู่ | HTTP Method | Path URL | Controller Method | สิทธิ์การเข้าถึง (Auth) | รายละเอียด |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/api/v1/auth/register` | `authController.register` | Public | สมัครสมาชิกใหม่ (Hash password) |
| **Auth** | `POST` | `/api/v1/auth/login` | `authController.login` | Public | เข้าสู่ระบบ และรับ JWT Token |
| **Auth** | `GET` | `/api/v1/auth/me` | `authController.getMe` | User/Admin (Bearer Token) | ดึงข้อมูลผู้ใช้ปัจจุบันที่ล็อกอินอยู่ |
| **User** | `GET` | `/api/v1/users/profile` | `userController.getProfile` | User/Admin (Bearer Token) | ดึงข้อมูลโปรไฟล์และที่อยู่ |
| **User** | `PATCH` | `/api/v1/users/profile` | `userController.updateProfile` | User/Admin (Bearer Token) | แก้ไขข้อมูลชื่อ, เบอร์โทร |
| **Cart** | `GET` | `/api/v1/users/cart` | `userController.getCart` | User (Bearer Token) | ดึงรายการสินค้าในตะกร้า (Populate สินค้า) |
| **Cart** | `POST` | `/api/v1/users/cart` | `userController.addToCart` | User (Bearer Token) | เพิ่มสินค้าลงตะกร้า (ทบจำนวนถ้าซ้ำ) |
| **Cart** | `PATCH` | `/api/v1/users/cart/:itemId`| `userController.updateCartItemQuantity` | User (Bearer Token) | แก้ไขจำนวนชิ้นในตะกร้า |
| **Cart** | `DELETE`| `/api/v1/users/cart/:itemId`| `userController.removeCartItem` | User (Bearer Token) | ลบสินค้าออกจากตะกร้า |
| **Cart** | `DELETE`| `/api/v1/users/cart` | `userController.clearCart` | User (Bearer Token) | ล้างตะกร้าทั้งหมด |
| **Order**| `POST` | `/api/v1/orders` | `orderController.createOrder` | User (Bearer Token) | สร้างคำสั่งซื้อ (Snapshot & ตัดสต็อก) |
| **Order**| `GET` | `/api/v1/orders/my-orders` | `orderController.getMyOrders` | User (Bearer Token) | ดูประวัติคำสั่งซื้อของตัวเอง |
| **Order**| `GET` | `/api/v1/orders/:id` | `orderController.getOrderById` | User/Admin (Bearer Token) | ดูรายละเอียดคำสั่งซื้อเดี่ยว |
| **Order**| `GET` | `/api/v1/orders` | `orderController.getAllOrders` | Admin Only | แอดมินดูคำสั่งซื้อทั้งหมดในระบบ |
| **Order**| `PATCH` | `/api/v1/orders/:id/status`| `orderController.updateOrderStatus` | Admin Only | แอดมินอัปเดตสถานะ (shipped/completed) |
| **Product**| `GET` | `/api/v1/products` | `productController.getProducts` | Public | ค้นหาและกรองสินค้า (Search, Filter) |
| **Product**| `GET` | `/api/v1/products/:id` | `productController.getProductById` | Public | ดูรายละเอียดสินค้าและ Variants |
| **Product**| `POST` | `/api/v1/products` | `productController.createProduct` | Admin Only | เพิ่มสินค้าใหม่เข้าระบบ |
| **Product**| `PATCH` | `/api/v1/products/:id` | `productController.updateProduct` | Admin Only | แก้ไขรายละเอียดสินค้า |
| **Product**| `DELETE`| `/api/v1/products/:id` | `productController.deleteProduct` | Admin Only | ลบสินค้าออกจากระบบ |

---

## 8. แนวทางสำหรับเพื่อนๆ ในทีมที่ต้อง Implement ต่อ (Next Steps for Team)

1. **K'Fon (Auth)**:
   - นำแผนภาพใน [ข้อ 3](#3-uml-sequence-diagram-1-ระบบสมาชิกและความปลอดภัย-auth-controller--middleware) ไปใช้เขียน `src/controllers/auth.controller.js` และ `src/middlewares/auth.middleware.js` โดยใช้แพ็กเกจ `bcrypt` และ `jsonwebtoken` ที่ติดตั้งไว้แล้ว
2. **K'Iy (Profile & Cart)**:
   - นำแผนภาพใน [ข้อ 4](#4-uml-sequence-diagram-2-ระบบจัดการโปรไฟล์และตะกร้าสินค้า-user-controller) ไปใช้เขียน `src/controllers/user.controller.js` เพื่อจัดการ Subdocument `cart` และ `addresses` ใน User Model
3. **K'Nick (Checkout & Order)**:
   - นำแผนภาพใน [ข้อ 5](#5-uml-sequence-diagram-3-ระบบสั่งซื้อและเช็คเอาต์-order-controller---checkout-flow) ไปใช้เขียน `src/controllers/order.controller.js` โดยเน้นเรื่อง Snapshot และการตัดสต็อกสินค้า
4. **K'Dear & K'Thiem (Products & Landing)**:
   - เชื่อมต่อหน้า Landing Page และ Product Detail เข้ากับ `src/controllers/product.controller.js` ที่มีอยู่แล้วตามตาราง Endpoint Matrix ใน [ข้อ 7](#7-api-endpoint-matrix-ตารางสรุป-route-และ-controller)
