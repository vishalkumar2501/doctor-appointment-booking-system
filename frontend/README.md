# 🩺 DocBook – Doctor Appointment Booking Platform

A full-stack **Doctor Appointment Booking Web Application** built using the **MERN Stack**.  
The platform allows patients to browse doctors, book appointments in real time, and securely complete payments through a mock payment workflow.

---

## 🚀 Features

### 🔐 Authentication & Authorization
- JWT-based secure authentication  
- Role-based access control (**Admin / Patient**)  
- Protected backend routes  
- Persistent login using localStorage  

### 🧑‍⚕️ Doctor Management
- Browse doctors by speciality  
- View doctor profiles  
- Dynamic availability system  
- Real-time slot conflict prevention  

### 📅 Appointment System
- Book appointments with available doctors  
- Automatic double-booking prevention  
- Cancel appointments  
- Track payment status  
- Admin view of all appointments  

### 💳 Mock Payment Gateway
- Simulates real-world payment systems (Stripe / Razorpay style)  
- Backend order creation  
- Server-side payment verification  
- Backend-controlled payment confirmation  
- Secure transaction validation  
- Payment status tracking  

### 🛠 Admin Panel
- Add new doctors  
- View all appointments  
- Cancel appointments  
- Monitor booking activity  

### 📱 UI/UX
- Fully responsive design  
- Built using Tailwind CSS  
- Clean and modern dashboard layout  

---

## 🏗 Tech Stack

### Frontend
- React.js  
- React Router  
- Context API  
- Tailwind CSS  
- Axios  

### Backend
- Node.js  
- Express.js  
- MongoDB  
- Mongoose  
- JWT (JSON Web Token)  

---

🧠 Core Functional Logic

🔹 Slot Booking Algorithm

Generates time slots dynamically
Prevents booking past time slots
Blocks already booked slots
Ensures no scheduling conflicts

🔹 Secure Payment Workflow

Payment order created from backend
Server-side verification before confirmation
Prevents client-side payment manipulation
Updates appointment only after verification
