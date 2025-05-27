type WebSocketEventMap = {
  open: Event;
  message: MessageEvent;
  error: Event;
  close: CloseEvent;
};

type WebSocketEvent = keyof WebSocketEventMap;

interface WebSocketClientOptions {
  reconnect?: boolean;
  maxRetries?: number;
  reconnectInterval?: number;
  protocols?: string | string[];
}

export class WebSocketClient {
  private url: string;
  private options: Required<WebSocketClientOptions>;
  private socket: WebSocket | null = null;
  private retryCount = 0;
  private manuallyClosed = false;
  private listeners: {
    [K in WebSocketEvent]?: Array<(event: WebSocketEventMap[K]) => void>;
  } = {};

  constructor(url: string, options: WebSocketClientOptions = {}) {
    this.url = url;
    this.options = {
      reconnect: options.reconnect ?? true,
      maxRetries: options.maxRetries ?? 5,
      reconnectInterval: options.reconnectInterval ?? 2000,
      protocols: options.protocols ?? [],
    };

    this.connect();
  }

  private connect() {
    this.socket = new WebSocket(this.url, this.options.protocols);
    this.manuallyClosed = false;

    this.socket.onopen = (e) => {
      this.retryCount = 0;
      this.emit("open", e);
    };

    this.socket.onmessage = (e) => {
      this.emit("message", e);
    };

    this.socket.onerror = (e) => {
      this.emit("error", e);
    };

    this.socket.onclose = (e) => {
      this.emit("close", e);

      if (
        !this.manuallyClosed &&
        this.options.reconnect &&
        this.retryCount < this.options.maxRetries
      ) {
        this.retryCount++;
        setTimeout(() => this.connect(), this.options.reconnectInterval);
      }
    };
  }

  send(data: string | Record<string, unknown>) {
    const payload = typeof data === "string" ? data : JSON.stringify(data);
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(payload);
    } else {
      console.warn("WebSocket is not open. Cannot send message.");
    }
  }

  close() {
    this.manuallyClosed = true;
    this.socket?.close();
  }

  getState(): number {
    return this.socket?.readyState ?? WebSocket.CLOSED;
  }

  on<K extends WebSocketEvent>(
    event: K,
    callback: (e: WebSocketEventMap[K]) => void
  ) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event]!.push(callback);
  }

  off<K extends WebSocketEvent>(
    event: K,
    callback: (e: WebSocketEventMap[K]) => void
  ) {
    const callbacks = this.listeners[event];
    if (!callbacks) return;

    this.listeners[event] = callbacks.filter(
      (cb) => cb !== callback
    ) as typeof callbacks;
  }

  private emit<K extends WebSocketEvent>(
    event: K,
    payload: WebSocketEventMap[K]
  ) {
    this.listeners[event]?.forEach((cb) => cb(payload));
  }
}
