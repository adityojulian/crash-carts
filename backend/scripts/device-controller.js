//Sending c-2-d messages through the IoT-hub client:
var iot_hub_Client = require("azure-iothub").Client;
var iot_hub_Message = require("azure-iot-common").Message;

const iotHubConnectionString = process.env.IotHubConnectionString; //These are defined in launch.json (env)

var my_IoT_Hub_Client = null;

function startDeviceController() {
	my_IoT_Hub_Client = iot_hub_Client.fromConnectionString(
		iotHubConnectionString
	);
	my_IoT_Hub_Client.open(function (err) {
		if (err) {
			console.error("Could not connect: " + err.message);
		} else {
			console.log("Service client connected");
			serviceClient.getFeedbackReceiver(receiveFeedback);
		}
	});
}
function sendMessageToDevice(device, message_body, sucessFeedback) {
	if (my_IoT_Hub_Client) {
		//Build IoT Hub message
		var message = new iot_hub_Message(message_body);
		message.ack = "full";
		message.messageId = "My Message ID";
		//Send to device
		my_IoT_Hub_Client.send(device, message, printResultFor(sucessFeedback));
	}
}

function printResultFor(op) {
	return function printResult(err, res) {
		if (err) console.log(op + " error: " + err.toString());
		if (res) console.log(op + " status: " + res.constructor.name);
	};
}

function receiveFeedback(err, receiver) {
	receiver.on("message", function (msg) {
		console.log("Feedback message:");
		console.log(msg.getData().toString("utf-8"));
	});
}

module.exports = { startDeviceController, sendMessageToDevice };
