# MySubscriptions – Subscription Tracker System

MySubscriptions is a full-stack MERN application designed to help users manage and track recurring subscriptions efficiently. The platform allows users to organize subscriptions, monitor renewal dates, and analyze monthly spending through a clean and responsive dashboard.

---

# 🚀 Features

## 🔐 Authentication & Security
- User Registration and Login
- JWT-based Authentication
- Protected Routes
- Secure Password Hashing using bcrypt

---

## 📋 Subscription Management
- Add New Subscriptions
- Edit Existing Subscriptions
- Delete Subscriptions
- View Active Subscriptions
- Track Renewal Dates

---

## 📊 Dashboard & Analytics
- Monthly Spending Overview
- Subscription Analytics
- Category-wise Tracking
- Search and Filtering Functionality

---

## 🎨 User Experience
- Responsive User Interface
- Modern Dashboard Design
- Clean Navigation System
- Organized Layout Structure

---

# 🛠️ Tech Stack

## Frontend
- React / Next.js
- Tailwind CSS
- TypeScript

## Backend
- Node.js
- Express.js
- MongoDB
- Mongoose

## Authentication
- JWT (JSON Web Tokens)
- bcrypt.js

---

# 📁 Project Structure

```bash
mysubscriptions-main/
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── seed/
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   ├── next.config.ts
│   ├── package.json
│   └── tsconfig.json
│
├── README.md
└── .gitignore
```

---

# ⚙️ Installation & Setup

## 1️⃣ Clone the Repository

```bash
git clone https://github.com/your-username/subscription-tracker-system.git
```

---

## 2️⃣ Navigate to Project Directory

```bash
cd subscription-tracker-system
```

---

## 3️⃣ Install Backend Dependencies

```bash
cd backend
npm install
```

---

## 4️⃣ Install Frontend Dependencies

Open a new terminal and run:

```bash
cd frontend
npm install
```

---

# 🔑 Environment Variables

Create a `.env` file inside the `backend/` directory and add the following:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

---

# ▶️ Running the Application

## Run Backend Server

Inside the `backend` folder:

```bash
npm run dev
```

Backend server will run on:

```bash
http://localhost:5000
```

---

## Run Frontend

Inside the `frontend` folder:

```bash
npm run dev
```

Frontend application will run on:

```bash
http://localhost:3000
```

---

# 📌 API Endpoints

## Authentication Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/users/register` | Register User |
| POST | `/api/users/login` | Login User |

---

## Subscription Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/subscriptions` | Get All Subscriptions |
| POST | `/api/subscriptions` | Create Subscription |
| PUT | `/api/subscriptions/:id` | Update Subscription |
| DELETE | `/api/subscriptions/:id` | Delete Subscription |

---

# 📸 Screenshots

Add screenshots of:
- Login Page
- Dashboard
- Subscription Cards
- Analytics Section

---

# 📌 Future Improvements

- Email Notifications for Renewals
- Payment Integration
- Dark Mode
- Subscription Reminder System
- Export Reports
- Mobile Optimization

---

# 🤝 Contributing

Contributions are welcome. Feel free to fork the repository and submit pull requests.

---

# 📄 License

This project is licensed under the MIT License.

---

# 👨‍💻 Author

Developed by **Dhairya Shah**
