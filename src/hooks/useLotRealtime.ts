import { useCallback, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import {
  auctionExtendedSchema,
  bidPlacedSchema,
  lotStateSchema,
} from '../schemas/auctions/lot-realtime.schema';
import type { LotDetails } from '../schemas/lots/lot-details.schema';
import type { LotRealtimeState } from '../types/auctions/lot-realtime.types';
import { useLotStatusCheck } from './useLotStatusCheck';
import { notifyWalletUpdated } from '../services/authEvents';

const initialState = (lotId: string): LotRealtimeState => ({
  lotId,
  lot: null,
  hasSnapshot: false,
  bids: [],
  seenBidIds: [],
  connectionError: null,
});

const getSocketUrl = () => {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
  return apiBaseUrl
    ? new URL(apiBaseUrl, window.location.origin).origin
    : undefined;
};

export const useLotRealtime = (
  lotId: string | undefined,
  initialLot: LotDetails | null,
) => {
  const [state, setState] = useState<LotRealtimeState | null>(null);

  useEffect(() => {
    if (!lotId) {
      return;
    }

    const socket = io(getSocketUrl(), { autoConnect: false });

    const updateState = (
      update: (current: LotRealtimeState) => LotRealtimeState,
    ) => {
      setState((current) =>
        update(current?.lotId === lotId ? current : initialState(lotId)),
      );
    };

    const handleConnect = () => {
      updateState((current) => ({ ...current, connectionError: null }));
      socket.emit('join_lot', { lotId });
    };

    const handleLotState = (payload: unknown) => {
      const parsed = lotStateSchema.safeParse(payload);
      if (!parsed.success) {
        updateState((current) => ({
          ...current,
          connectionError: 'The server sent an invalid lot state.',
        }));
        return;
      }

      if (parsed.data.lot.id !== lotId) {
        return;
      }

      updateState((current) => ({
        ...current,
        lot: parsed.data.lot,
        hasSnapshot: true,
        bids: parsed.data.bids,
        seenBidIds: [],
        connectionError: null,
      }));
    };

    const handleBidPlaced = (payload: unknown) => {
      const parsed = bidPlacedSchema.safeParse(payload);
      if (!parsed.success) {
        updateState((current) => ({
          ...current,
          connectionError: 'The server sent an invalid bid update.',
        }));
        return;
      }

      const bid = parsed.data;
      if (bid.lotId !== lotId) {
        return;
      }

      notifyWalletUpdated();
      updateState((current) => {
        if (!current.lot || current.seenBidIds.includes(bid.bidId)) {
          return current;
        }

        return {
          ...current,
          lot: {
            ...current.lot,
            currentPrice: bid.currentPrice,
            auctionEnd: bid.auctionEnd,
          },
          bids: [
            { amount: bid.amount, createdAt: bid.createdAt },
            ...current.bids,
          ].slice(0, 25),
          seenBidIds: [...current.seenBidIds, bid.bidId],
          connectionError: null,
        };
      });
    };

    const handleAuctionExtended = (payload: unknown) => {
      const parsed = auctionExtendedSchema.safeParse(payload);
      if (!parsed.success) {
        updateState((current) => ({
          ...current,
          connectionError: 'The server sent an invalid auction update.',
        }));
        return;
      }

      if (parsed.data.lotId !== lotId) {
        return;
      }

      updateState((current) =>
        current.lot
          ? {
              ...current,
              lot: { ...current.lot, auctionEnd: parsed.data.auctionEnd },
              connectionError: null,
            }
          : current,
      );
    };

    const handleSocketError = (error: Error) => {
      updateState((current) => ({
        ...current,
        connectionError: error.message || 'Could not connect to live updates.',
      }));
    };

    const handleServerException = (payload: unknown) => {
      const message =
        typeof payload === 'object' &&
        payload !== null &&
        'message' in payload &&
        typeof payload.message === 'string'
          ? payload.message
          : 'The server rejected the live update request.';
      updateState((current) => ({ ...current, connectionError: message }));
    };

    socket.on('connect', handleConnect);
    socket.on('connect_error', handleSocketError);
    socket.on('exception', handleServerException);
    socket.on('lot_state', handleLotState);
    socket.on('bid_placed', handleBidPlaced);
    socket.on('auction_extended', handleAuctionExtended);
    socket.connect();

    return () => {
      socket.off('connect', handleConnect);
      socket.off('connect_error', handleSocketError);
      socket.off('exception', handleServerException);
      socket.off('lot_state', handleLotState);
      socket.off('bid_placed', handleBidPlaced);
      socket.off('auction_extended', handleAuctionExtended);

      if (socket.connected) {
        const disconnect = () => socket.disconnect();
        const timeout = window.setTimeout(disconnect, 600);
        socket.timeout(500).emit('leave_lot', { lotId }, () => {
          window.clearTimeout(timeout);
          disconnect();
        });
      } else {
        socket.disconnect();
      }
    };
  }, [lotId]);

  const currentState = state?.lotId === lotId ? state : null;
  const currentLot =
    currentState?.lot && initialLot
      ? {
          ...initialLot,
          ...currentState.lot,
          seller: initialLot.seller,
        }
      : initialLot;
  const onLotRefresh = useCallback(
    (updatedLot: LotDetails) => {
      if (!lotId) {
        return;
      }

      setState((current) =>
        current?.lotId === lotId
          ? { ...current, lot: updatedLot }
          : { ...initialState(lotId), lot: updatedLot },
      );
    },
    [lotId],
  );
  const statusCheckError = useLotStatusCheck({
    lotId,
    lot: currentLot,
    onLotRefresh,
  });

  return {
    lot: currentState?.lot ?? null,
    bids: currentState?.bids ?? [],
    hasSnapshot: currentState?.hasSnapshot ?? false,
    connectionError: currentState?.connectionError ?? null,
    statusCheckError,
  };
};
