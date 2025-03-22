import { useEffect, useState } from "react";
import { View, Text, Button, ScrollView } from "react-native";
import axios from "axios";
import { io } from "socket.io-client";
import RazorpayCheckout from "react-native-razorpay";

const payNow = () => {
  RazorpayCheckout.open({ key: "YOUR_KEY_ID", amount: 50000, currency: "INR" })
    .then((data) => alert("Payment Successful"))
    .catch((error) => alert("Payment Failed"));
};

const socket = io("http://localhost:5001");

const lockSeat = (seatID) => {
  socket.emit("lock-seat", seatID);
};

const API_URL = "http://localhost:5000";

const App = () => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    axios.get(`${API_URL}/events`).then((res) => setEvents(res.data));
  }, []);

  return (
    <ScrollView>
      {events.map(event => (
        <View key={event.id} style={{ margin: 20 }}>
          <Text>{event.name}</Text>
          <Button title="Book Now" />
        </View>
      ))}
    </ScrollView>
  );
};

export default App;
