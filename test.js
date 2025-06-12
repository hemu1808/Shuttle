// This file is ONLY for testing if your .env variables are loading.
import dotenv from "dotenv";

console.log("--- Starting Environment Test ---");

dotenv.config();

console.log("My Stripe Key is:", process.env.STRIPE_SECRET_KEY);
console.log("My JWT Secret is:", process.env.JWT_SECRET);
console.log("My Client URL is:", process.env.CLIENT_URL);

console.log("--- Test Complete ---");