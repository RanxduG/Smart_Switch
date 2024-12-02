const fs = require('fs');
const path = require('path');
const mqtt = require('mqtt');
const express = require('express');
const app = express();
const cors = require('cors');
app.use(cors());

// Serve the static files from the React frontend build directory
app.use(express.static(path.join(__dirname, '..', 'frontend', 'build')));

// For any requests that don't match, serve the index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'build', 'index.html'));
});

// AWS IoT Endpoint
const endpoint = "wss://d00743712qfllp00ocnt1-ats.iot.ap-south-1.amazonaws.com/mqtt"; // Replace with your AWS IoT WebSocket endpoint

// Path to your X.509 certificates
const privateKey = fs.readFileSync('Certifications/Private Key.key');  // Private key file
const clientCert = fs.readFileSync('Certifications/Device Certificate.crt'); // Certificate file
const caCert = fs.readFileSync('Certifications/AmazonRootCA1.pem');  // AWS IoT Root CA

// MQTT Client Configuration
const mqttClient = mqtt.connect(endpoint, {
  clientId: "webClient",
  cert: clientCert,
  key: privateKey,
  ca: caCert,
  protocol: 'mqtt',
  reconnectPeriod: 2000,
  keepalive: 60,
  debug: true
});

// Initial states for devices in each room
let deviceState = {
  livingRoom: {
    light1: "0",  // light state for living room
    fan: "0"      // fan state for living room
  },
  tvRoom: {
    light1: "0",  // light state for tv room
    fan: "0"      // fan state for tv room
  },
  room1: {
    light1: "0",  // light state for room1
    fan: "0"      // fan state for room1
  },
  room2: {
    light1: "0",  // light state for room2
    fan: "0"      // fan state for room2
  },
  room3: {
    light1: "0",  // light state for room3
    fan: "0"      // fan state for room3
  },
  room4: {
    light1: "0",  // light state for room4
    fan: "0"      // fan state for room4
  }
};

// Define topics for MQTT communication
const subscribeTopic = "esp32/status";  // Topic to listen for updates
const publishTopic = "esp32/commands"; // Topic to publish device control commands

// Listen for successful MQTT connection
mqttClient.on('connect', () => {
    console.log("Connected to AWS IoT Core!");
    mqttClient.subscribe(subscribeTopic);  // Subscribe to the topic to receive updates from the ESP32
});

// Listen for messages from AWS IoT
mqttClient.on('message', (topic, message) => {
    if (topic === subscribeTopic) {
        const payload = JSON.parse(message.toString());
        console.log('Received Message:', payload);  // You can use this to log or update the frontend with the current states
    }
});

// Forward messages from the web client to AWS IoT
app.use(express.json());

// POST endpoint to handle device control commands from frontend
app.post('/control', (req, res) => {
    const { room, device, state } = req.body;  // Extract room, device, and state from the incoming request body
    console.log('Received command:', { room, device, state });

    // Ensure the room exists in the deviceState object
    if (!deviceState[room]) {
        return res.status(400).json({ error: 'Invalid room name' });
    }

    // Update the state of the specified device in the specified room
    if (deviceState[room][device] !== undefined) {
        deviceState[room][device] = state;
    } else {
        return res.status(400).json({ error: 'Invalid device name' });
    }

    // Prepare the message to be sent to AWS IoT (contains both device states for the room)
    const message = JSON.stringify(deviceState);

    // Publish the updated state to AWS IoT Core
    mqttClient.publish(publishTopic, message, { qos: 1 }, (err) => {
        if (err) {
            console.error('Failed to send message to AWS IoT:', err);
            return res.status(500).json({ error: 'Failed to send message to AWS IoT' });
        }
        console.log('Message sent to AWS IoT:', message);
        res.status(200).json({ message: 'State updated', state: deviceState });  // Respond to the frontend with the updated state
    });
});

// Start Express server
const port = 3000;
app.listen(port, '127.0.0.1', () => {
    console.log('Server is running on http://127.0.0.1:3000');
});
