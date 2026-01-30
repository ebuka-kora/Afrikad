import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

/**
 * Hook to listen for webhook events via Server-Sent Events (SSE)
 * Automatically invalidates React Query queries when webhooks are received
 */
export const useWebhookEvents = () => {
  const queryClient = useQueryClient();
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    // Get auth token
    const token = localStorage.getItem('adminToken');
    if (!token) {
      return; // Don't connect if not authenticated
    }

    // Create SSE connection
    const eventSource = new EventSource(
      `${API_BASE_URL}/webhooks/events?token=${encodeURIComponent(token)}`
    );

    eventSourceRef.current = eventSource;

    // Handle incoming events
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const { type, event: eventType } = data;

        console.log('📥 Webhook event received:', { type, event: eventType });

        // Invalidate relevant queries based on event type
        switch (type) {
          case 'transaction':
          case 'kora':
            // Invalidate transaction-related queries
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
            queryClient.invalidateQueries({ queryKey: ['user-transactions'] });
            break;

          case 'wallet':
            // Invalidate wallet-related queries
            queryClient.invalidateQueries({ queryKey: ['wallets'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
            break;

          case 'card':
            // Invalidate card-related queries
            queryClient.invalidateQueries({ queryKey: ['cards'] });
            queryClient.invalidateQueries({ queryKey: ['user-cards'] });
            break;

          case 'user':
            // Invalidate user-related queries
            queryClient.invalidateQueries({ queryKey: ['users'] });
            queryClient.invalidateQueries({ queryKey: ['user'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
            break;

          default:
            // For unknown types, invalidate all to be safe
            queryClient.invalidateQueries();
        }
      } catch (error) {
        console.error('Error parsing webhook event:', error);
      }
    };

    // Handle connection errors
    eventSource.onerror = (error) => {
      console.error('SSE connection error:', error);
      // EventSource will automatically attempt to reconnect
    };

    // Cleanup on unmount
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [queryClient]);

  return null; // This hook doesn't return anything
};
