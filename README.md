# Loan Management System (LMS)

A full-stack Loan Management System where borrowers apply for loans and internal executives manage loans across their lifecycle.

---

## 1. Features & Requirements Covered

### Borrower Application Flow
* **Step 1: Sign Up / Login** with hashed passwords and protected routes.
* **Step 2: Personal Details & Server-Side BRE**: Evaluates age (23–50), minimum salary (₹25,000/month), PAN format regex, and employment mode (rejects Unemployed).
* **Step 3: Document Upload**: Upload salary slip in PDF/JPG/PNG format (max 5 MB) linked to the application.
* **Step 4: Loan Configuration & Live Math**: Sliders for Loan Amount (₹50K–₹5L) and Tenure (30–365 days) with a fixed 12% p.a. interest rate. Live Simple Interest calculation:
  $$\text{SI} = \frac{P \times R \times T}{365 \times 100}$$
  $$\text{Total Repayment} = P + \text{SI}$$
 
  Submitting sets status to `APPLIED`.

### Operations Dashboard (RBAC Guarded)
* **Sales Desk**: Tracks registered leads who have not yet submitted a loan application.
* **Sanction Desk**: Reviews applied loans; approves to `SANCTIONED` or rejects with a reason.
* **Disbursement Desk**: Marks sanctioned loans as `DISBURSED`.
* **Collection Desk**: Records payments with unique UTR numbers, amounts, and dates; auto-closes the loan once total repayment is met.
* **RBAC Enforcement**: Each executive role can access only their assigned module, Admin can access all modules, and Borrowers can only access the application portal. Enforced on both frontend and backend.

---

## 2. Tech Stack

* **Frontend**: Next.js (App Router), TypeScript, Tailwind CSS
* **Backend**: Node.js, Express.js, TypeScript
* **Database**: MongoDB + Mongoose
* **Authentication**: JWT + bcrypt
* **File Storage**: Cloudinary

---

## 3. Seeded Login Credentials

Run the database seed script to populate one account per role.  
**Password for all accounts:** `Password@123`

| Role | Email | Module Access |
| :--- | :--- | :--- |
| **Admin** | `admin@lms.com` | All Modules |
| **Sales** | `sales@lms.com` | `/dashboard/sales` |
| **Sanction** | `sanction@lms.com` | `/dashboard/sanction` |
| **Disbursement** | `disbursement@lms.com` | `/dashboard/disbursement` |
| **Collection** | `collection@lms.com` | `/dashboard/collection` |
| **Borrower** | `borrower@lms.com` | `/apply` |

---

## 4. Setup & Running the Project

### Prerequisites
* Node.js (v18+)
* MongoDB running locally or on MongoDB Atlas

### Backend Setup
1. Open a terminal and navigate to the backend folder:
   ```bash
   cd backend
   npm install
   ```
 Create a .env file:
   ```code
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/loan_management_db
JWT_SECRET=supersecretjwtkey123
CORS_ORIGIN=http://localhost:3000
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```
2. Run the database seed script:
```bash
npm run seed
```
3. Start the backend server:
```bash
npm run dev
```
### Frontend Setup
1. Open a new terminal and navigate to the frontend folder:
```bash
cd frontend
npm install
```
2. Create a .env file:
```code
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```
3. Start the frontend development server:
```bash
npm run dev
```
4. Access the web app at http://localhost:3000
