import { useState, useEffect } from "react";
import useWebSocket from "react-use-websocket";

let sharedWebSocket = null;
let messageSubscribers = new Set();

export const initWebSocket = (socketUrl) => {
	if (!sharedWebSocket) {
		sharedWebSocket = useWebSocket(socketUrl, {
			shouldReconnect: (closeEvent) => true,
		});
	}
	return sharedWebSocket;
};

export const subscribeToMessages = (callback) => {
	messageSubscribers.add(callback);
	return () => messageSubscribers.delete(callback);
};

export const getWebSocket = () => {
	return sharedWebSocket;
};
