# Shuttle Free - Real-Time Ticket Booking App

Shuttle Free is a **real-time transit ticket booking app** that allows users to book seats dynamically while ensuring **real-time seat availability, secure payments, and AI-powered recommendations**.

##  Key Features
 **User Authentication** (Firebase Auth)  
 **Real-time Seat Availability** (WebSockets)  
 **Secure Payments** (Razorpay API)  
 **Dynamic Pricing Model** (AI-based)  
 **Scalable Backend** (Node.js & MongoDB)  
 **Mobile & Web Support** (React.js & React Native)  

---

## 🏗 Tech Stack
###  **Frontend**
- React.js (Web)
- React Native (Mobile)
- Tailwind CSS (Web UI)
- Firebase Authentication

###  **Backend**
- Node.js (Express.js)
- MongoDB (MongoDB Atlas)
- WebSockets (Socket.io)
- Razorpay API (Payments)

###  **Other Integrations**
- Image Uploads (Cloudinary)
- Docker (Optional for deployment)
- AWS (Future Deployment: Amplify, AppSync, DynamoDB)

---

##  Quick Start Guide

###  **Clone the Repository**
```sh
git clone https://github.com/your-username/shuttle-free.git
cd shuttle-free
```

---

##  **2. Backend Setup**
```sh
cd backend
npm install
```

###  **Configure Environment Variables**
Create a `.env` file in the `backend` folder:
```env
PORT=5000
MONGO_URI=mongodb+srv://your_mongo_user:password@cluster.mongodb.net/shuttleDB
RAZORPAY_KEY_ID=your_key
RAZORPAY_SECRET=your_secret
JWT_SECRET=your_jwt_secret
```

###  **Run the Backend Server**
```sh
npm start
```
---

##  **3. Frontend Setup**
```sh
cd frontend
npm install
npm start
```
> **Note:** Ensure the backend is running before launching the frontend.

---

##  **4. Mobile Setup (React Native)**
```sh
cd mobile
npm install
npx react-native start
```
> **Note:** For testing, use an **Android Emulator** or **Expo Go** for iOS.

---

##  **5. API Endpoints**
###  **User Authentication**
| Method | Endpoint      | Description  |
|--------|-------------|--------------|
| `POST` | `/api/register` | User Signup  |
| `POST` | `/api/login`    | User Login   |

###  **Ticket Booking**
| Method | Endpoint        | Description |
|--------|----------------|-------------|
| `GET`  | `/api/bookings` | View Bookings |
| `POST` | `/api/bookings` | Book a Ticket |
| `DELETE` | `/api/bookings/:id` | Cancel Booking |

###  **Payment Processing**
| Method | Endpoint        | Description |
|--------|----------------|-------------|
| `POST` | `/api/payments` | Process Payment |

---

## 📸 Screenshots
🚀 *Coming Soon...*

---

##  Future Enhancements
- 🌍 **Deploy on AWS (Amplify, AppSync, DynamoDB)**
- 📱 **Native Android/iOS Apps**
- 🤖 **AI-powered Pricing Optimization**
- 🛒 **Coupon & Discounts System**

---

## Contributing
Pull requests are welcome! Feel free to **open an issue** for discussion.

## License
This project is licensed under the **MIT License**.
```

---

### **What This README Covers**
✔ **Project Overview**  
✔ **Key Features**  
✔ **Tech Stack**  
✔ **Installation & Setup** (Backend, Frontend, Mobile)  
✔ **API Endpoints**  
✔ **Future Roadmap**  
✔ **Contribution Guidelines & License**  
