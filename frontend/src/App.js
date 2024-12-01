import React, { useState } from 'react';
import './App.css';

const RoomButton = ({ device, state, onClick }) => {
  return (
    <button className={`device-button ${state}`} onClick={onClick}>
      {device}: {state === "on" ? "ON" : "OFF"}
    </button>
  );
};

function App() {
  const [lightState, setLightState] = useState("off");
  const [fanState, setFanState] = useState("off");

  const handleToggle = async (device) => {
    const newState = device === "light" ? (lightState === "on" ? "0" : "1") : (fanState === "on" ? "0" : "1");
    // Logic to send the state to backend...
    if (device === "light") setLightState(newState === "1" ? "on" : "off");
    else setFanState(newState === "1" ? "on" : "off");
  };

  return (
    <div className="App">
      <h1>Smart Home Control</h1>
      <div className="rooms">
        <div className="room room1">Room 1</div>
        <div className="room tv-room">TV Room</div>
        <div className="room living-room">Living Room</div>
        <div className="room room2">
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
        <div className="room dining-room">Dining Room</div>
        <div className="room room3">Room 3</div>
        <div className="room kitchen">Kitchen</div>
        <div className="room room4">Room 4</div>
      </div>
    </div>
  );
}

export default App;
