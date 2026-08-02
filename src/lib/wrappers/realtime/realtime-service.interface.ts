export interface BroadcastEventPayload<T = any> {
  channel: string;
  event: string;
  payload: T;
}

export interface IRealtimeService {
  broadcastEvent<T>(eventData: BroadcastEventPayload<T>): Promise<void>;
}
