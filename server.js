require("dotenv").config();
const express = require("express");
const app = express();
const path = require("path");
const http = require("http");
const mqtt = require("mqtt");
const WebSocket = require("ws");
const corsOptions = require("./backend/config/corsOptions");
const PORT = process.env.PORT || 3500;

// Azure
// Custom modules to receive telemetry and send messages/methods through the IoT Hub.
const EventHubReader = require("./backend/scripts/event-hub-reader.js");
const DeviceController = require("./backend/scripts/device-controller.js");

// CORS
const cors = require("cors");
app.use(cors(corsOptions));

app.use("/", express.static(path.join(__dirname, "backend", "/public")));

// CONNECTING SERVER TO BUILD PATH
// const root = path.join(__dirname, "frontend", "build");
// app.use(express.static(root));

// app.get("/", function (req, res) {
// 	res.send({ sensorData: "100 grams" });
// });

// Websocket
// const websocketSetup = require("./backend/websocket");
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
wss.on("connection", function connection(ws) {
	ws.on("message", function message(data) {
		console.log("Message received through WebSocket" + data);
		//Parse device from websocket data received (JSON field 'Device')
		const receivedMessage = JSON.parse(data);
		//Send cloud-to-device message:
		console.log("Sending message to " + receivedMessage.Device);
		DeviceController.sendMessageToDevice(
			receivedMessage.Device,
			"Message body",
			"send"
		);
	});
});

// const client = mqtt.connect("mqtt://192.168.0.144:1883");
// const topic = "sensor_test";

// client.on("connect", () => {
// 	console.log("connected");
// 	client.subscribe(topic);
// });

// client.on("message", (topic, message) => {
// 	console.log(message.toString());
// 	websocketSetup.sendMessage(message.toString()); // Use the WebSocket module to send messages
// });

// websocketSetup.initialize(server); // Initialize WebSocket with the server

//1. Adding our telemetry reader... with a silly listener (it simply prints telemetry received to the console)
function telemetryCallback(message, date, deviceId) {
	//a. Print to the console (just to check we are receiving telemetry)
	console.log(
		date + " --> Message from" + deviceId + ":\n" + JSON.stringify(message)
	);
	//b.  Check that we can send messages to the device:
	//DeviceController.sendMessageToDevice(deviceId, 'Hi!', 'send');
	//c. Use the websocket
	//Let's re-package all fields into a single JSON package
	const payload = {
		IotData: message,
		MessageDate: date || Date.now().toISOString(),
		DeviceId: deviceId,
	};
	var data = JSON.stringify(payload);
	//Traverse all connected clients...
	wss.clients.forEach((client) => {
		if (client.readyState === WebSocket.OPEN) {
			try {
				//... and send them the update (data), through their specific socket (1 client = 1 socket)
				client.send(data);
			} catch (e) {
				console.error(e);
			}
		}
	});
}

const eventHubReader = new EventHubReader(
	process.env.IotHubConnectionString,
	process.env.EventHubConsumerGroup
);
eventHubReader.startReadMessage(telemetryCallback);

//2. Adding our device controller...
DeviceController.startDeviceController();

server.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
