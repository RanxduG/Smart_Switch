import React, { useState } from 'react';
import './App.css';

const API_URL = "http://13.233.251.126:3000/"; // Replace with your backend URL

const RoomButton = ({ device, state, onClick }) => {
  return (
    <button className={`device-button ${state}`} onClick={onClick}>
      {device}: {state === "on" ? "ON" : "OFF"}
    </button>
  );
};

function App() {
  const [roomStates, setRoomStates] = useState({
    room2: { light1: "off", fan: "off" },
    room1: { light1: "off", fan: "off" },
    tvRoom: { light1: "off", fan: "off" },
    livingRoom: { light1: "off", fan: "off" },
    room3: { light1: "off", fan: "off" },
    room4: { light1: "off", fan: "off" }
  });

  const handleToggle = async (room, device) => {
    const currentState = roomStates[room][device];
    const newState = currentState === "on" ? "off" : "on"; // Toggle state between on and off
    const body = { room, device, state: newState === "on" ? "1" : "0" }; // Send '1' for ON, '0' for OFF

    try {
      const response = await fetch(`${API_URL}control`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        // Update the state only if the message is successfully sent to the backend
        setRoomStates((prevState) => ({
          ...prevState,
          [room]: {
            ...prevState[room],
            [device]: newState, // Toggle between on and off
          },
        }));
      } else {
        console.error("Failed to toggle device state");
      }
    } catch (error) {
      console.error("Error toggling device state", error);
    }
  };

  return (
    <div className="App">
      <h1>Smart Home Control</h1>
      <div className="rooms">
        {/* Room Components */}
        {Object.keys(roomStates).map((room, index) => (
          <div key={index} className={`room ${room}`}>
            <h2>{room.replace(/([A-Z])/g, ' $1').trim()}</h2>
            <RoomButton
              device="Light"
              state={roomStates[room].light1}
              onClick={() => handleToggle(room, "light1")}
            />
            <RoomButton
              device="Fan"
              state={roomStates[room].fan}
              onClick={() => handleToggle(room, "fan")}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
