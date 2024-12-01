import React, { useState, useEffect } from 'react';
import './App.css';

const RoomButton = ({ device, state, onClick }) => {
  return (
    <button className={`device-button ${state}`} onClick={onClick}>
      {device}: {state === "on" ? "ON" : "OFF"}
    </button>
  );
};
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";

function App() {
  const [lightState, setLightState] = useState("off");
  const [fanState, setFanState] = useState("off");

  // useEffect(() => {
  //   // Fetch initial states of devices from the server
  //   async function fetchStates() {
  //     try {
  //       const response = await fetch('http://localhost:3000/status');
  //       const data = await response.json();
  //       setLightState(data.room2.light1 === "1" ? "on" : "off");
  //       setFanState(data.room2.fan === "1" ? "on" : "off");
  //     } catch (error) {
  //       console.error("Failed to fetch device states", error);
  //     }
  //   }
  //   fetchStates();
  // }, []);

  const handleToggle = async (device) => {
    const newState = device === "light" ? (lightState === "on" ? "0" : "1") : (fanState === "on" ? "0" : "1");
    const body = { room: "room2", device: device === "light" ? "light1" : "fan", state: newState };

    try {
      const response = await fetch('http://localhost:3000/control', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        device === "light" ? setLightState(newState === "1" ? "on" : "off") : setFanState(newState === "1" ? "on" : "off");
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
        <div className="room unavailable">Living Room</div>
        <div className="room unavailable">TV Room</div>
        <div className="room unavailable">Dining Room</div>
        <div className="room unavailable">Kitchen</div>
        <div className="room unavailable">Bathroom</div>
        <div className="room unavailable">Room 1</div>
        <div className="room active">
          <h2>Room 2</h2>
          <RoomButton
            device="Light"
            state={lightState}
            onClick={() => handleToggle("light")}
          />
          <RoomButton
            device="Fan"
            state={fanState}
            onClick={() => handleToggle("fan")}
          />
        </div>
        <div className="room unavailable">Room 3</div>
        <div className="room unavailable">Room 4</div>
      </div>
    </div>
  );
}

export default App;
