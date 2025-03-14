# MediBed - Hospital Bed Management System

## 🏥 Overview
MediBed is a **hospital bed management system** designed for **hospital staff** to efficiently allocate and deallocate beds as patients are admitted and discharged. The system helps keep track of **patients, doctors, staff, and beds** in real-time. It provides authentication and role-based access, ensuring smooth hospital operations.

## ✨ Features
- **Bed Management**: Allocate and deallocate beds for patients.
- **Authentication & Authorization**: JWT-based authentication with role-based access control.
- **Superadmin Controls**:
  - Add and remove doctors.
  - Add and remove staff members.
- **Staff Controls**:
  - Admit and discharge patients.
  - Track patient health conditions (Critical, Normal, Moderate).
  - Maintain health history and generate graphs based on patient conditions.
- **Search & Filter**:
  - Search patients, doctors, and staff by their IDs.
  - Filter patient records based on health conditions.
- **Responsive Design**: Fully optimized for mobile and desktop use.

## 🚀 Tech Stack
- **Backend**: Node.js, Express.js, MongoDB, Mongoose, JWT, Bcrypt, CORS, Cookie-Parser
- **Frontend**: React (Vite), Tailwind CSS, Axios, Recharts
- **Database**: MongoDB (Mongoose ORM)

## 🔧 Installation & Setup

### 1️⃣ Fork and Clone the Repository

# Clone the repo
git clone https://github.com/YOUR_USERNAME/MediBed.git
cd MediBed

### 2️⃣ Backend Setup

cd backend
npm install
npm run server
### 3️⃣ Frontend Setup

cd frontend
npm install
npm start
 ### 4️⃣ Run Both Frontend and Backend

npm run dev
### ⚡ Scripts

npm start        # Starts the frontend server
npm run server   # Starts the backend server
npm run dev      # Runs both frontend and backend concurrently
npm run build    # Builds the frontend for production
npm run lint     # Lints the codebase
 ### 🔒 License
This project is licensed under the MIT License. You are free to use, modify, and distribute it with attribution.

### 🤝 Contributing


1. Fork the repository
2. Create a feature branch (git checkout -b feature-name)
3. Commit changes (git commit -m "Added feature")
4. Push to the branch (git push origin feature-name)
5. Create a Pull Request
