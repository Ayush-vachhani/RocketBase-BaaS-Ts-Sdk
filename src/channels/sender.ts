export function sendMessage(this: any, message: string) {
    if (this.socket.readyState === WebSocket.CONNECTING) {
        // WebSocket is still connecting, queue the message
        this.messageQueue.push(message);
    } else if (this.socket.readyState === WebSocket.OPEN) {
        // WebSocket is open, send the message
        this.socket.send(message);
    } else {
        // Handle other states (CLOSED, CLOSING) if needed
        console.warn('WebSocket is not in a state to send messages.');
    }
}

export function processMessageQueue(this: any): void {
    while (this.messageQueue.length > 0) {
        const message = this.messageQueue.shift();
        if (message) {
            this.socket.send(message);
        }
    }
}