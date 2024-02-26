// useWebSocketHook.js

import { useState, useEffect } from "react";

let sharedWebSocket = null;
let messageSubscribers = new Set();

const useWebSocketHook = (socketUrl) => {
	const [messageHistory, setMessageHistory] = useState([]);

	if (!sharedWebSocket) {
		sharedWebSocket = new WebSocket(socketUrl);

		sharedWebSocket.onmessage = (message) => {
			messageSubscribers.forEach((callback) => callback(message));
		};
	}

	useEffect(() => {
		const messageListener = (message) => {
			setMessageHistory((prev) => [...prev, message]);
		};

		messageSubscribers.add(messageListener);
		return () => messageSubscribers.delete(messageListener);
	}, []);

	const sendMessage = (message) => {
		if (sharedWebSocket.readyState === WebSocket.OPEN) {
			sharedWebSocket.send(message);
		}
	};

	return { sendMessage, messageHistory };
};

export default useWebSocketHook;
