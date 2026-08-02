import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { IRealtimeService, BroadcastEventPayload } from './realtime-service.interface';

// Singleton Supabase Admin Client (Service Role — server-side only)
const supabaseAdmin: SupabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Supabase Realtime Broadcast Wrapper — Pure TypeScript Module (no DI framework)
 * Used by Server Actions to broadcast events to connected clients via WebSockets.
 */
export const supabaseRealtimeWrapper: IRealtimeService = {
  async broadcastEvent<T>(eventData: BroadcastEventPayload<T>): Promise<void> {
    const channel = supabaseAdmin.channel(eventData.channel);

    await channel.send({
      type: 'broadcast',
      event: eventData.event,
      payload: eventData.payload,
    });

    // Unsubscribe after broadcast to prevent idle channel accumulation
    await supabaseAdmin.removeChannel(channel);
  },
};
