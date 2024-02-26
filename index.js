"use strict";

var clientFromConnectionString =
	require("azure-iot-device-amqp").clientFromConnectionString;
var Message = require("azure-iot-device").Message;

var connStr = "[IoT Hub Device Connection string]";

var client = clientFromConnectionString(connStr);

function printResultFor(op) {
	return function printResult(err, res) {
		if (err) console.log(op + " error: " + err.toString());
		if (res) console.log(op + " status: " + res.constructor.name);
	};
}

var i = 0;

var connectCallback = function (err) {
	if (err) {
		console.log("Could not connect to IoT Hub: " + err);
	} else {
		console.log("Client connected to IoT Hub");

		client.on("message", function (msg) {
			client.complete(msg, printResultFor("completed"));

			if (msg.data[0] == 42) {
				console.log("\x1b[33m", "Command = " + msg.data);
				console.log("\x1b[0m", "------------------");
			} else {
				console.log("\x1b[31m", "Command = " + msg.data);
				console.log("\x1b[0m", "------------------");
			}
		});

		// Create a message and send it to the IoT Hub every second
		setInterval(function () {
			i++;

			var data = JSON.stringify({ numberOfCycles: i });
			var message = new Message(data);

			console.log("Telemetry sent: " + message.getData());
			client.sendEvent(message, printResultFor("send"));
		}, 2000);
	}
};

console.log("\x1b[31m", "NodeJs IoTHub DEMO");
console.log("\x1b[0m", "==================");

client.open(connectCallback);
