const fs = require('fs');
const path = require('path');
const mqtt = require('mqtt');
const express = require('express');
const app = express();
const cors = require('cors');
app.use(cors());

app.use(express.static(path.join(__dirname, '..', 'frontend', 'build')));


// For any requests that don't match, serve the index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'build', 'index.html'));
});
// AWS IoT Endpoint
const endpoint = "wss://d00743712qfllp00ocnt1-ats.iot.ap-south-1.amazonaws.com/mqtt"; // Replace with your AWS IoT WebSocket endpoint

// Path to your X.509 certificates
const privateKey = fs.readFileSync('Certifications/Private Key.key');   // Private key file
const clientCert = fs.readFileSync('Certifications/Device Certificate.crt'); // Certificate file
const caCert = fs.readFileSync('Certifications/AmazonRootCA1.pem');  // AWS IoT Root CA

// MQTT Client Configuration
const mqttClient = mqtt.connect(endpoint, {
  clientId: "webClient", 
  cert: clientCert,
  key: privateKey,
  ca: caCert,
  protocol: 'mqtt',
  reconnectPeriod: 1000,
  keepalive: 60,
  debug: true
});

// Initial states for light and fan
let deviceState = {
  light1: "0",
  fan: "0"
};

// Define topic
const subscribeTopic = "esp32/status";
const publishTopic = "esp32/commands";

// Listen for connection
mqttClient.on('connect', () => {
    console.log("Connected to AWS IoT Core!");
    mqttClient.subscribe(subscribeTopic);
});

// Listen for messages from AWS IoT
mqttClient.on('message', (topic, message) => {
    if (topic === subscribeTopic) {
        const payload = JSON.parse(message.toString());
        console.log('Received Message:', payload);
    }
});

// Forward message from the web client
// This will handle requests from the frontend
app.use(express.json());

// POST endpoint to receive control commands from frontend
app.post('/control', (req, res) => {
    const { device, state } = req.body;
    console.log('Received command:', { device, state });

    // Update the state
    if (device === "light1") {
        deviceState.light1 = state;
    } else if (device === "fan") {
        deviceState.fan = state;
    }

    // Prepare the JSON message with both light and fan states
    const message = JSON.stringify(deviceState);

    // Publish the message to AWS IoT
    mqttClient.publish(publishTopic, message, { qos: 1 }, (err) => {
        if (err) {
            console.error('Failed to send message to AWS IoT:', err);
            return res.status(500).json({ error: 'Failed to send message to AWS IoT' });
        }
        console.log('Message sent to AWS IoT:', message);
        res.status(200).json({ message: 'State updated', state: deviceState });
    });
});

// Start Express server
const port = 80;
app.listen(port, '0.0.0.0', () => {
    console.log('Server is running on http://0.0.0.0:80');
  });
  
