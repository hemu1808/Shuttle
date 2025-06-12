# ShuttleNow - Real-Time Shuttle Booking Platform

ShuttleNow is a full-stack web application designed to provide a seamless, real-time booking experience for shuttle services. It features a modern, interactive user interface, separate portals for users and administrators, and live-tracking capabilities. This project was built from the ground up, progressively adding advanced features to create a robust and professional-level platform.

## Key Features

This project incorporates a wide range of modern web development features:

* **Real-Time Seat Selection:**
    * Users can view shuttle layouts and select seats.
    * Uses **Socket.IO** to implement "soft locking," where a seat selected by one user is instantly shown as unavailable to all other users in real-time, preventing booking conflicts.

* **Dual Authentication System:**
    * **User Authentication:** A secure portal for users to sign up, log in, and manage their profiles using JWT (JSON Web Tokens).
    * **Admin Authentication:** A separate, protected portal for administrators to manage the platform.

* **Interactive Mapping & Routing:**
    * Integrates the **Google Maps API** to provide a dynamic, responsive map experience.
    * **Live Route Drawing:** Automatically calculates and displays the shuttle's route from origin to destination using the Directions Service.
    * **Live Shuttle Tracking:** Admins can simulate a shuttle's journey, and its location is updated on the map for all users in real-time via WebSockets.

* **Full-Fledged Admin Dashboard:**
    * **Event CRUD:** Administrators have full Create, Read, Update, and Delete capabilities for shuttle events.
    * **Intelligent Location Input:** The event creation form uses the Google Places Autocomplete API. Admins can type a location name (e.g., "Atlanta"), and the form automatically populates the precise latitude and longitude, ensuring map accuracy.
    * The dashboard is a protected route, accessible only to authenticated admins.

* **Flexible Booking Options:**
    * **Profile-Based Booking:** Logged-in users can book tickets that are automatically saved to their "My Bookings" profile.
    * **Guest Checkout:** Users have the option to book a ticket by providing only a phone number, offering a frictionless experience for one-time users.

* **Digital QR Code Tickets:**
    * Upon successful payment and booking confirmation, the system generates a unique **QR Code** for each ticket.
    * Users can view their QR codes on the booking success page and in their profile, which can be scanned for verification at the shuttle entry point.

* **Modern, Responsive UI:**
    * A clean, professional user interface built with React, featuring a two-column layout.
    * Smooth animations and transitions powered by **Framer Motion**.
    * Includes a dark mode/light mode theme toggle for user preference.

## How It Was Built

This project was developed incrementally, starting with a basic concept and layering on advanced features.

1.  **Foundation (MERN Stack):** The project started with a core **MongoDB, Express.js, React, and Node.js** stack to handle basic event display and booking logic.
2.  **Introducing Real-Time:** **Socket.IO** was integrated to enable real-time communication between the client and server, forming the basis for the live seat locking and map tracking features.
3.  **Building the Admin Panel:** A separate authentication system was built for admins, along with a full CRUD API to manage events. The frontend dashboard was then created to consume this API.
4.  **Enhancing the User Experience:** The booking flow was upgraded to include full user authentication, guest checkout options, and profile management.
5.  **Advanced Map Integration:** The initial static map was replaced with a fully interactive **Google Maps** component. This was further enhanced with the **Directions API** to draw routes and the **Places API** for intelligent, responsive location searching in the admin panel.
6.  **Ticket System:** The booking confirmation process was upgraded to generate and store QR codes, transforming a simple booking into a verifiable digital ticket.

## Tech Stack

#### Backend

* **Node.js & Express.js:** For the server-side logic and API.
* **MongoDB & Mongoose:** As the database for storing events, users, and bookings.
* **Socket.IO:** For real-time, bidirectional communication.
* **Stripe:** To handle payment processing securely.
* **JSON Web Tokens (JWT):** For securing user and admin authentication.
* **bcryptjs:** For securely hashing passwords.
* **qrcode:** For generating QR code tickets on the server.

#### Frontend

* **React:** For building the user interface.
* **React Router:** For client-side routing and navigation.
* **Axios:** For making API requests to the backend.
* **Socket.IO Client:** To connect to the real-time server.
* **Google Maps API for React (`@react-google-maps/api`):** For all map-related functionalities.
* **Framer Motion:** For smooth page transitions and animations.

## Setup and Installation

To run this project locally:

1.  **Clone the repository:**
    ```bash
    git clone [your-repository-url]
    cd shuttle-now
    ```
2.  **Backend Setup:**
    ```bash
    # Navigate to the root folder
    npm install
    # Create a .env file and add your keys (MONGO_URI, STRIPE_SECRET_KEY, JWT_SECRET)
    node server.js
    ```
3.  **Frontend Setup:**
    ```bash
    # Navigate to the frontend folder
    cd frontend
    npm install
    # Create a .env file and add your Google Maps API Key (REACT_APP_GOOGLE_MAPS_API_KEY)
    npm start
    ```
