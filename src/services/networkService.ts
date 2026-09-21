export type NetworkListener = (isOnline: boolean) => void;

class NetworkService {
  private online: boolean =
    typeof navigator !== 'undefined' && typeof navigator.onLine === 'boolean'
      ? navigator.onLine
      : true;
  private listeners: Set<NetworkListener> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.handleStatusChange(true));
      window.addEventListener('offline', () => this.handleStatusChange(false));
    }
  }

  private handleStatusChange(isOnline: boolean) {
    this.online = isOnline;
    this.listeners.forEach((listener) => listener(isOnline));
  }

  public isOnline(): boolean {
    return this.online ?? true;
  }

  public setOnlineState(isOnline: boolean) {
    this.handleStatusChange(isOnline);
  }

  public subscribe(listener: NetworkListener): () => void {
    this.listeners.add(listener);
    listener(this.isOnline());

    return () => {
      this.listeners.delete(listener);
    };
  }
}

export const networkService = new NetworkService();
