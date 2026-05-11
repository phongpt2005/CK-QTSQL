import { useEffect, useRef, useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';

/** Matches DraftAllocation on backend */
export interface DraftAllocation {
  warehouseId: number;
  warehouseName?: string;
  locationId: number;
  locationCode?: string;
  availableQty: number;
  allocatedQty: number;
}

/** Matches DraftReservation on backend */
export interface DraftReservation {
  draftId: string;
  userId: number;
  productId: number;
  productName: string;
  requiredQty: number;
  allocations: DraftAllocation[];
  createdAt: number;
  confirmed: boolean;
}

interface UseAllocationSocketOptions {
  /** Current user ID (from auth) */
  userId: number | null;
  /** Called when server tells us to open the allocation modal */
  onModalOpen?: (draft: DraftReservation) => void;
  /** Called when server tells us to close the modal */
  onModalClose?: (data: { draftId: string; cancelled?: boolean; draft?: DraftReservation }) => void;
  /** Called when another device of the same user updates state */
  onStateUpdate?: (draft: DraftReservation) => void;
  /** Called when another user changes stock for a product */
  onStockUpdate?: (data: { productId: number; released?: boolean; allocations?: any[] }) => void;
  /** Called when a location QR is confirmed */
  onLocationConfirmed?: (data: { draftId: string; locationCode: string; warehouseId: number; locationId: number }) => void;
  /** Called on error */
  onError?: (data: { message: string }) => void;
}

/**
 * Custom hook for managing WebSocket connection to the Allocation Gateway.
 * 
 * Handles:
 * - Auto-connect/disconnect based on userId
 * - Room joining (user room auto-joined by server)
 * - Debounced draft updates (300ms)
 * - Event listeners for modal/state/stock sync
 */
export function useAllocationSocket(options: UseAllocationSocketOptions) {
  const {
    userId,
    onModalOpen,
    onModalClose,
    onStateUpdate,
    onStockUpdate,
    onLocationConfirmed,
    onError,
  } = options;

  const socketRef = useRef<Socket | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [connected, setConnected] = useState(false);

  // Stable refs for callbacks to avoid re-creating socket on every render
  const callbacksRef = useRef(options);
  callbacksRef.current = options;

  useEffect(() => {
    if (!userId) return;

    // Use empty string to connect to the current host (e.g. port 5173) and let Vite proxy the WebSocket to port 3000. This bypasses Windows Firewall blocking port 3000.
    const backendUrl = import.meta.env.VITE_API_URL
      ? import.meta.env.VITE_API_URL.replace('/api', '')
      : '';

    const socket = io(`${backendUrl}/allocation`, {
      query: { userId: String(userId) },
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      console.log('[AllocationSocket] Connected:', socket.id);
    });

    socket.on('disconnect', () => {
      setConnected(false);
      console.log('[AllocationSocket] Disconnected');
    });

    // ── Server → Client events ──

    socket.on('modal:open', (data: { draft: DraftReservation }) => {
      callbacksRef.current.onModalOpen?.(data.draft);
    });

    socket.on('modal:close', (data) => {
      callbacksRef.current.onModalClose?.(data);
    });

    socket.on('state:update', (data: { draft: DraftReservation }) => {
      callbacksRef.current.onStateUpdate?.(data.draft);
    });

    socket.on('stock:update', (data) => {
      callbacksRef.current.onStockUpdate?.(data);
    });

    socket.on('location:confirmed', (data) => {
      callbacksRef.current.onLocationConfirmed?.(data);
    });

    socket.on('error', (data: { message: string }) => {
      callbacksRef.current.onError?.(data);
    });

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
      setConnected(false);
    };
  }, [userId]);

  // ── Client → Server emitters ──

  const emitScanProduct = useCallback((productCode: string, requiredQty: number, targetUserId?: number) => {
    socketRef.current?.emit('scan:product', { productCode, requiredQty, targetUserId });
  }, []);

  const emitScanLocation = useCallback((draftId: string, locationCode: string) => {
    socketRef.current?.emit('scan:location', { draftId, locationCode });
  }, []);

  /**
   * Debounced draft update. Waits 300ms after the last call before emitting.
   */
  const emitDraftUpdate = useCallback((draftId: string, allocations: DraftAllocation[]) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      socketRef.current?.emit('draft:update', { draftId, allocations });
    }, 300);
  }, []);

  const emitDraftConfirm = useCallback((draftId: string) => {
    socketRef.current?.emit('draft:confirm', { draftId });
  }, []);

  const emitDraftCancel = useCallback((draftId: string) => {
    socketRef.current?.emit('draft:cancel', { draftId });
  }, []);

  return {
    connected,
    emitScanProduct,
    emitScanLocation,
    emitDraftUpdate,
    emitDraftConfirm,
    emitDraftCancel,
  };
}
