import { RedisClient } from "bun";

interface ExamSession {
	examId: string;
	examAttemptId: string;
	lastHeartbeat: number;
	isActive: boolean;
	userAgent?: string;
	sessionId?: string;
	startTime: number;
	warningCount: number;
}

export class ExamSessionManager {
	private static instance: ExamSessionManager;
	private valkey: RedisClient;
	private readonly HEARTBEAT_TIMEOUT = 60000; // 1 min
	private readonly CLEANUP_INTERVAL = 30000; // 30 sec
	private cleanupInterval: NodeJS.Timeout;

	private constructor() {
		this.valkey = new RedisClient();

		this.cleanupInterval = setInterval(() => {
			this.cleanupExpiredSessions();
		}, this.CLEANUP_INTERVAL);
	}

	static getInstance(): ExamSessionManager {
		if (!ExamSessionManager.instance) {
			ExamSessionManager.instance = new ExamSessionManager();
		}
		return ExamSessionManager.instance;
	}

	async createSession(
		examId: string,
		examAttemptId: string,
		userAgent?: string,
		sessionId?: string,
	): Promise<ExamSession> {
		const session: ExamSession = {
			examId,
			examAttemptId,
			lastHeartbeat: Date.now(),
			isActive: true,
			userAgent,
			sessionId,
			startTime: Date.now(),
			warningCount: 0,
		};

		await this.valkey.set(
			`exam:${examId}-attempt:${examAttemptId}`,
			JSON.stringify(session),
		);
		console.log(
			`[EXAM SESSION] Created session for exam ${examId} attempt ${examAttemptId}`,
		);
		return session;
	}

	async updateHeartbeat(
		examId: string,
		examAttemptId: string,
		timestamp: number,
	): Promise<boolean> {
		const session = await this.getSession(examId, examAttemptId);
		if (!session || !session.isActive) return false;

		session.lastHeartbeat = timestamp;
		await this.valkey.set(
			`exam:${examId}-attempt:${examAttemptId}`,
			JSON.stringify(session),
		);
		console.log(
			`[HEARTBEAT] Updated for exam ${examId} attempt ${examAttemptId} at ${new Date(timestamp).toISOString()}`,
		);
		return true;
	}

	async terminateSession(
		examId: string,
		examAttemptId: string,
		reason: string,
	): Promise<boolean> {
		const session = await this.getSession(examId, examAttemptId);
		if (!session) return false;

		session.isActive = false;
		await this.valkey.set(
			`exam:${examId}-attempt:${examAttemptId}`,
			JSON.stringify(session),
		);
		console.log(
			`[EXAM TERMINATION] Exam ${examId} attempt ${examAttemptId} terminated: ${reason}`,
		);

		await this.logTermination(session, reason);
		await this.valkey.del(`exam:${examId}-attempt:${examAttemptId}`);
		return true;
	}

	async getSession(
		examId: string,
		examAttemptId: string,
	): Promise<ExamSession | undefined> {
		const data = await this.valkey.get(
			`exam:${examId}-attempt:${examAttemptId}`,
		);
		return data ? (JSON.parse(data) as ExamSession) : undefined;
	}

	private async cleanupExpiredSessions(): Promise<void> {
		try {
			const keys = await this.valkey.keys("exam:*-attempt:*");
			const now = Date.now();
			let expiredCount = 0;

			for (const key of keys) {
				const data = await this.valkey.get(key);
				if (!data) continue;

				const session: ExamSession = JSON.parse(data);
				if (
					session.isActive &&
					now - session.lastHeartbeat > this.HEARTBEAT_TIMEOUT
				) {
					// Parse out examId and examAttemptId from key
					const match = key.match(/^exam:(.*)-attempt:(.*)$/);
					if (!match) continue;
					const examId = match[1];
					const examAttemptId = match[2];
					await this.terminateSession(
						examId,
						examAttemptId,
						"Heartbeat timeout - session expired",
					);
					expiredCount++;
				}
			}

			if (expiredCount > 0) {
				console.log(`[CLEANUP] Terminated ${expiredCount} expired sessions`);
			}
		} catch (err) {
			console.error("[CLEANUP ERROR]", err);
		}
	}

	private async logTermination(
		session: ExamSession,
		reason: string,
	): Promise<void> {
		try {
			console.log(`[AUDIT LOG] Exam ${session.examId} terminated: ${reason}`);
			// Here you could push to DB, Kafka, etc.
		} catch (err) {
			console.error("[AUDIT LOG ERROR]", err);
		}
	}

	destroy(): void {
		if (this.cleanupInterval) {
			clearInterval(this.cleanupInterval);
		}
		this.valkey.close();
	}
}
