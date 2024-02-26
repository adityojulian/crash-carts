// const socketIo = require("socket.io");
const { Server } = require("socket.io");
let io;

const initialize = (server) => {
	console.log("initialize");
	io = new Server(server);

	io.on("connection", (socket) => {
		console.log("Client connected");
		socket.on("disconnect", () => {
			console.log("Client disconnected");
		});
	});
};

const sendMessage = (message) => {
	io.emit("mqtt_message", message);
};

module.exports = {
	initialize,
	sendMessage,
};
