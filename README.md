# 🩺 DocBook — Doctor Appointment Booking System

A full-stack **MERN Doctor Appointment Booking System** designed to provide a complete digital appointment management platform for **Patients, Doctors, and Admins**.

---

## 🌐 Live Demo & Deployment

| Portal | Description | Live Link |
| :--- | :--- | :--- |
| 🧑‍⚕️ **Patient Portal** | Browse doctors, dynamic slot booking & payments | [Live Patient App](https://doctor-appointment-booking-system-beta-ten.vercel.app) |
| 👨‍💼 **Doctor / Admin Panel** | Manage availability, appointments, doctors & reviews | [Live Admin/Doctor Panel](https://docbook-admin-three.vercel.app) |
| ⚙️ **Backend API** | REST API with MongoDB, JWT, Cloudinary & Razorpay | [Live Backend API](https://docbook-backend-bm7l.onrender.com) |

> 🔑 **Demo Admin Credentials**: `admin@prescripto.com` / `admin123`

---

## 🚀 Key Features

### 👤 Patient
- Register & Login with JWT authentication
- Browse doctors and view availability
- Book appointments using dynamically generated slots
- Secure online payment with Razorpay
- Cancel appointments with refund handling
- View complete appointment history
- Receive automated appointment reminders
- Submit ratings and reviews after completed appointments

### 👨‍⚕️ Doctor
- Doctor dashboard and profile management
- Configure working days and working hours
- Configure lunch breaks
- Dynamic 30-minute appointment slot generation
- Block emergency/unavailable slots
- View and manage appointments
- Mark appointments as completed
- View patient reviews and ratings
- Track appointments and earnings

### 👨‍💼 Admin
- Admin dashboard
- Add and invite doctors
- Manage doctors
- View all appointments
- Cancel appointments
- Handle administrative refunds
- Monitor platform activity

---

## ⭐ Technical Highlights

### Dynamic Appointment Scheduling
Appointment slots are generated dynamically based on:

- Doctor working days
- Working hours
- Lunch breaks
- Blocked slots
- Existing appointments

Only availability configuration, blocked slots, and actual appointments are stored instead of maintaining thousands of pre-generated slots.

### 🔒 Concurrency & Data Integrity
- MongoDB unique partial index prevents double booking
- Atomic cancellation state transitions prevent duplicate cancellations
- Atomic refund locks prevent duplicate refunds
- Unique appointment index prevents duplicate feedback
- Database integrity checks for orphan and contradictory records

### 💳 Payment & Refund System
- Razorpay payment integration
- Backend-controlled payment amounts
- Payment signature verification
- Patient/Doctor/Admin cancellation handling
- Automated refund eligibility calculation
- Refund status tracking
- Duplicate refund protection

### 📧 Appointment Reminder System
Implemented using **Node Cron + Nodemailer**.

- Sends reminders one day before eligible appointments
- Reminder eligibility depends on booking lead time
- Cancelled/completed appointments are excluded
- Failed emails remain retryable
- Duplicate reminders are prevented

### ⭐ Feedback & Rating System
- Feedback allowed only after completed appointments
- One review per appointment
- 1–5 star ratings
- MongoDB aggregation for doctor ratings
- Automatic review statistics calculation

### 🔐 Security
- JWT authentication
- Role-based authorization
- Protected routes
- Password hashing
- Patient/Doctor ownership validation
- IDOR protection
- Tampered/expired JWT protection
- Sensitive environment variables excluded from API responses

### 📜 Historical Appointment Records
Appointments preserve historical snapshots of important patient and doctor information such as:

- Patient details
- Doctor details
- Consultation fees
- Appointment location

Profile updates therefore do not modify historical appointment records.

---

## 🛠 Tech Stack

**Frontend**
- React.js
- Tailwind CSS
- Axios
- React Router
- Vite

**Backend**
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT

**Services & Integrations**
- Razorpay
- Nodemailer
- Node Cron
- Cloudinary
- Multer

**Tools**
- Git
- GitHub
- Postman
- VS Code

---

## 🏗 Architecture

```text
Patient / Doctor / Admin
          │
          ▼
     React Frontend
          │
         Axios
          │
          ▼
    Express REST API
          │
    ┌─────┴─────┐
    │           │
Controllers   Services
    │           │
    └─────┬─────┘
          │
       Mongoose
          │
          ▼
       MongoDB
```

---

## 📂 Project Structure

```text
doc-book/
│
├── frontend/       # Patient application
├── admin/          # Doctor & Admin application
├── backend/        # Express REST API
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   └── config/
│
└── README.md
```

---

## ⚙️ Installation

### 1. Clone Repository
```bash
git clone https://github.com/vishalkumar2501/doctor-appointment-booking-system.git
cd doctor-appointment-booking-system
```

### 2. Backend
```bash
cd backend
npm install
npm start
```

### 3. Patient Frontend
```bash
cd frontend
npm install
npm run dev
```

### 4. Doctor/Admin Panel
```bash
cd admin
npm install
npm run dev
```

---

## 🔑 Environment Variables

Create a `.env` file inside `backend/`:

```env
MONGODB_URI=
JWT_SECRET=

CLOUDINARY_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_SECRET_KEY=

ADMIN_EMAIL=
ADMIN_PASSWORD=

SMTP_HOST=
SMTP_PORT=
SMTP_SECURE=
SMTP_USER=
SMTP_PASS=
SMTP_FROM=

RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
CURRENCY=INR

NODE_ENV=development
ALLOW_MOCK_REFUNDS=true
```

---

## 🔄 Application Workflow

```text
Patient
  ↓
Login
  ↓
Browse Doctors
  ↓
Select Date & Slot
  ↓
Book Appointment
  ↓
Online Payment
  ↓
Appointment Confirmation
  ↓
Reminder Email
  ↓
Doctor Completes Appointment
  ↓
Patient Submits Feedback
  ↓
Doctor Rating Updated
```

---

## 🚀 Future Improvements
- WebRTC video consultation
- Socket.IO real-time updates
- Push notifications
- Appointment rescheduling
- Digital prescriptions
- Advanced doctor search & filtering
- Admin analytics dashboard

---

## 👨‍💻 Author

**Vishal Kumar**

- GitHub: [https://github.com/vishalkumar2501](https://github.com/vishalkumar2501)
- Email: vishalkumar2501kvs@gmail.com

---

⭐ If you find this project useful, consider starring the repository.