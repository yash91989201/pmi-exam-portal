import { useEffect, useMemo, useState } from "react";

export function useExamTimer(durationInMinutes: number, onTimeUp: () => void) {
	const [timeLeft, setTimeLeft] = useState(durationInMinutes * 60);
	const totalDurationInSeconds = durationInMinutes * 60;

	useEffect(() => {
		if (timeLeft <= 0) {
			onTimeUp();
			return;
		}
		const interval = setInterval(() => {
			setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
		}, 1000);
		return () => clearInterval(interval);
	}, [timeLeft, onTimeUp]);

	const timeSpentInSeconds = useMemo(() => {
		return totalDurationInSeconds - timeLeft;
	}, [totalDurationInSeconds, timeLeft]);

	const timeSpentInMinutes = useMemo(() => {
		return Math.ceil(timeSpentInSeconds / 60);
	}, [timeSpentInSeconds]);

	const timerColor = useMemo(() => {
		if (timeLeft <= 300) return "text-red-600 dark:text-red-400";
		if (timeLeft <= 900) return "text-orange-600 dark:text-orange-400";
		return "text-green-600 dark:text-green-400";
	}, [timeLeft]);

	const formattedTime = useMemo(() => {
		const minutes = Math.floor(timeLeft / 60);
		const seconds = timeLeft % 60;
		return `${minutes}:${seconds.toString().padStart(2, "0")}`;
	}, [timeLeft]);

	const formattedTimeSpent = useMemo(() => {
		const minutes = Math.floor(timeSpentInSeconds / 60);
		const seconds = timeSpentInSeconds % 60;
		return `${minutes}:${seconds.toString().padStart(2, "0")}`;
	}, [timeSpentInSeconds]);

	return {
		timeLeft,
		formattedTime,
		timerColor,
		timeSpentInSeconds,
		timeSpentInMinutes,
		formattedTimeSpent,
	};
}
