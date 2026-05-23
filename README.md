# Embroidery Server (Backend API)

This is the secure full-stack backend production server that powers the Embroidery & Jewellery E-Commerce platform. It manages secure data authentication, role-based access control, automated email verification, media storage integrations, and optimized payment processing.

---

## 🚀 Core Features & Architecture

* **Secure Authentication:** Implements stateless **JWT (JSON Web Tokens)** for robust user login, signup, and session management.
* **Role-Based Access Control (RBAC):** Restricts or grants API routes dynamically based on user roles (e.g., standard customers vs. administrative dashboards).
* **Two-Step Email Verification:** Integrated with **Nodemailer** to dispatch secure validation OTPs/links during signup to guarantee valid user credentials.
* **Automated Product Image Storage:** Instead of cluttering local storage, product images are uploaded automatically to a dedicated GitHub repository (`product-images`) via the **Octokit API**.
* **Payment Gateway Integration:** Securely handles client-to-server payment authorization workflows using **Razorpay**.
* **High-Performance Aggregation:** Utilizes complex **MongoDB Aggregation Pipelines** to deliver high-speed analytics for the admin dashboard and filter product listings efficiently.

---

## 🛠️ Tech Stack & Dependencies

* **Runtime Environment:** Node.js
* **Backend Framework:** Express.js
* **Database:** MongoDB (using Mongoose ODM)
* **Email Client:** Nodemailer
* **Third-Party APIs:** Razorpay SDK, GitHub Octokit

---

## ⚙️ Environment Variables Required

To run this backend locally, create a `.env` file in the root directory and configure the following keys:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
NODEMAILER_EMAIL=your_verification_email
NODEMAILER_PASSWORD=your_email_app_password
OCTOKIT_AUTH_TOKEN=your_github_classic_token
