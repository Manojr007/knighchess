interface QueueEntry {
    userId: string;
    username: string;
    timeControl: string;
    socketId: string;
    timestamp: number;
}

export class MatchmakingQueue {
    private queue: QueueEntry[] = [];

    addToQueue(userId: string, username: string, timeControl: string, socketId: string): void {
        // Remove user if already in queue
        this.removeFromQueue(userId);

        this.queue.push({
            userId,
            username,
            timeControl,
            socketId,
            timestamp: Date.now()
        });

        console.log(`User ${username} added to queue for ${timeControl}. Queue size: ${this.queue.length}`);
    }

    findMatch(userId: string, timeControl: string): QueueEntry | null {
        // Find another user with same time control (not the same user)
        const match = this.queue.find(entry =>
            entry.timeControl === timeControl &&
            entry.userId !== userId
        );

        if (match) {
            // Remove both users from queue
            this.removeFromQueue(userId);
            this.removeFromQueue(match.userId);
            console.log(`Match found! ${userId} vs ${match.userId}`);
            return match;
        }

        return null;
    }

    removeFromQueue(userId: string): void {
        const initialLength = this.queue.length;
        this.queue = this.queue.filter(entry => entry.userId !== userId);
        if (this.queue.length < initialLength) {
            console.log(`User ${userId} removed from queue. Queue size: ${this.queue.length}`);
        }
    }

    removeBySocketId(socketId: string): void {
        const initialLength = this.queue.length;
        this.queue = this.queue.filter(entry => entry.socketId !== socketId);
        if (this.queue.length < initialLength) {
            console.log(`Socket ${socketId} removed from queue. Queue size: ${this.queue.length}`);
        }
    }

    getQueueSize(timeControl?: string): number {
        if (timeControl) {
            return this.queue.filter(entry => entry.timeControl === timeControl).length;
        }
        return this.queue.length;
    }
}

export const matchmakingQueue = new MatchmakingQueue();
