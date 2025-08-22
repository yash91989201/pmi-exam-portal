import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const MAX_WARNINGS = 2;
const INACTIVITY_THRESHOLD = 2 * 60 * 1000;
const DEVTOOLS_THRESHOLD = 160;

export function useCheatDetection({
	examId,
	examSubmitted,
	onTerminate,
	isImpersonating = false,
}: {
	examId: string;
	examSubmitted: React.RefObject<boolean>;
	onTerminate: (payload: { examId: string; reason: string }) => void;
	isImpersonating?: boolean;
}) {
	const [warningCount, setWarningCount] = useState(0);
	const [showWarningDialog, setShowWarningDialog] = useState(false);
	const [isMonitoring, setIsMonitoring] = useState(!isImpersonating);

	const lastActivityTime = useRef(Date.now());
	const warningShown = useRef(false);

	useEffect(() => {
		// 🚨 Disable detection if not monitoring.
		if (!isMonitoring || examSubmitted.current) return;

		let suspiciousActivityCount = 0;

		const updateActivityTime = () => {
			lastActivityTime.current = Date.now();
		};

		const showWarning = (reason: string) => {
			if (warningShown.current) return;

			suspiciousActivityCount += 1;
			setWarningCount(suspiciousActivityCount);
			warningShown.current = true;

			toast.warning(
				`Warning ${suspiciousActivityCount}/${MAX_WARNINGS}: ${reason}`,
				{ duration: 3000 },
			);

			setShowWarningDialog(true);

			setTimeout(() => {
				warningShown.current = false;
			}, 3000);

			if (suspiciousActivityCount > MAX_WARNINGS) {
				setTimeout(() => {
					if (!examSubmitted.current) {
						onTerminate({
							examId,
							reason: `Multiple violations detected: ${reason}`,
						});
					}
				}, 3000);
			}
		};

		const handleVisibilityChange = () => {
			document.hidden && !examSubmitted.current
				? showWarning("Tab switching or window minimization detected")
				: updateActivityTime();
		};

		const handleBlur = () => {
			!examSubmitted.current && showWarning("Window focus lost");
		};

		const handleMouseLeave = (e: MouseEvent) => {
			if (
				e.clientY <= 0 ||
				e.clientX <= 0 ||
				e.clientX >= window.innerWidth ||
				e.clientY >= window.innerHeight
			) {
				!examSubmitted.current && showWarning("Mouse left examination area");
			}
		};

		const handleKeyDown = (e: KeyboardEvent) => {
			updateActivityTime();
			if (
				(e.altKey && e.key === "Tab") ||
				(e.metaKey && e.key === "Tab") ||
				(e.ctrlKey && e.shiftKey && ["I", "C", "J"].includes(e.key)) ||
				e.key === "F12" ||
				(e.ctrlKey && e.key === "u")
			) {
				e.preventDefault();
				showWarning("Suspicious keyboard shortcut detected");
			}
		};

		const handleContextMenu = (e: MouseEvent) => {
			e.preventDefault();
			showWarning("Right-click detected");
		};

		const detectDevTools = () => {
			if (
				window.outerHeight - window.innerHeight > DEVTOOLS_THRESHOLD ||
				window.outerWidth - window.innerWidth > DEVTOOLS_THRESHOLD
			) {
				showWarning("Developer tools detected");
			}
		};

		const checkInactivity = () => {
			if (
				Date.now() - lastActivityTime.current > INACTIVITY_THRESHOLD &&
				!examSubmitted.current
			) {
				showWarning("Extended inactivity detected");
			}
		};

		const handlePageUnload = () => {
			navigator.sendBeacon(
				"/rpc/user/terminateExam",
				JSON.stringify({
					examId,
					reason: "Page refreshed, hideen or closed",
				}),
			);
		};

		window.addEventListener("blur", handleBlur);
		window.addEventListener("unload", handlePageUnload);
		window.addEventListener("pagehide", handlePageUnload);

		document.addEventListener("keydown", handleKeyDown);
		document.addEventListener("click", updateActivityTime);
		document.addEventListener("mouseleave", handleMouseLeave);
		document.addEventListener("mousemove", updateActivityTime);
		document.addEventListener("contextmenu", handleContextMenu);
		document.addEventListener("visibilitychange", handleVisibilityChange);
		window.addEventListener("beforeunload", handlePageUnload);

		const devToolsInterval = setInterval(detectDevTools, 2000);
		const inactivityInterval = setInterval(checkInactivity, 30000);

		return () => {
			window.removeEventListener("blur", handleBlur);
			window.removeEventListener("unload", handlePageUnload);
			window.removeEventListener("pagehide", handlePageUnload);

			document.removeEventListener("keydown", handleKeyDown);
			document.removeEventListener("click", updateActivityTime);
			document.removeEventListener("mouseleave", handleMouseLeave);
			document.removeEventListener("mousemove", updateActivityTime);
			document.removeEventListener("contextmenu", handleContextMenu);
			document.removeEventListener("visibilitychange", handleVisibilityChange);

			clearInterval(devToolsInterval);
			clearInterval(inactivityInterval);
		};
	}, [isMonitoring, examId, onTerminate, examSubmitted]);

	return {
		isMonitoring,
		warningCount,
		showWarningDialog,
		setIsMonitoring,
		setShowWarningDialog,
	};
}
