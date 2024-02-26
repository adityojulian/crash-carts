// TemperatureHumidityChart.js

import React, { useEffect, useState } from "react";
import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ResponsiveContainer,
} from "recharts";
import useWebSocketHook from "../hooks/UseWebScoketHook"; // Import your custom hook

function Landing() {
	const { messageHistory } = useWebSocketHook("ws://127.0.0.1:3500");
	const [data, setData] = useState([]);

	useEffect(() => {
		messageHistory.forEach((message) => {
			try {
				const parsedData = JSON.parse(message.data);
				const chartDataPoint = {
					timestamp: parsedData.MessageDate,
					Temperature: parsedData.IotData.temperature,
					Humidity: parsedData.IotData.humidity,
				};
				setData((currentData) => [...currentData, chartDataPoint]);
			} catch (error) {
				console.error("Error parsing message data:", error);
			}
		});
	}, [messageHistory]);

	return (
		<ResponsiveContainer width="100%" height={400}>
			<LineChart
				data={data}
				margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
			>
				<CartesianGrid strokeDasharray="3 3" />
				<XAxis dataKey="timestamp" />
				<YAxis />
				<Tooltip />
				<Legend />
				<Line
					type="monotone"
					dataKey="Temperature"
					stroke="#8884d8"
					activeDot={{ r: 8 }}
				/>
				<Line type="monotone" dataKey="Humidity" stroke="#82ca9d" />
			</LineChart>
		</ResponsiveContainer>
	);
}

export default Landing;
