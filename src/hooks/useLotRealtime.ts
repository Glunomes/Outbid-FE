import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { z } from 'zod';
import type { BidHistoryResponse } from '../schemas/bids/bid-history.schema';
import { auctionStatusSchema } from '../schemas/lots/lots-catalog.schema';
import type { LotDetails } from '../schemas/lots/lot-details.schema';

const lotStateSchema = z.object({
  lot: z.object({
    id: z.uuid(),
    name: z.string(),
    description: z.string().nullable(),
    startingPrice: z.string(),
    currentPrice: z.string().nullable(),
    auctionStart: z.iso.datetime().nullable(),
    auctionEnd: z.iso.datetime().nullable(),
    status: auctionStatusSchema,
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
    seller: z.object({ name: z.string() }),
  }),
  bids: z.array(
    z.object({
      amount: z.string(),
      createdAt: z.iso.datetime(),
    }),
  ),
});

const bidPlacedSchema = z.object({
  bidId: z.uuid(),
  lotId: z.uuid(),
  amount: z.string(),
  currentPrice: z.string(),
  auctionEnd: z.iso.datetime(),
  createdAt: z.iso.datetime(),
});

const auctionExtendedSchema = z.object({
  lotId: z.uuid(),
  auctionEnd: z.iso.datetime(),
});

type LotBid = BidHistoryResponse['bids'][number];

type RealtimeState = {
  lotId: string;
  lot: LotDetails | null;
  bids: LotBid[];
  seenBidIds: string[];
  connectionError: string | null;
};

const initialState = (lotId: string): RealtimeState => ({
  lotId,
  lot: null,
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

export const useLotRealtime = (lotId: string | undefined) => {
  const [state, setState] = useState<RealtimeState | null>(null);

  useEffect(() => {
    if (!lotId) {
      return;
    }

    const socket = io(getSocketUrl(), { autoConnect: false });

    const updateState = (update: (current: RealtimeState) => RealtimeState) => {
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

  return {
    lot: currentState?.lot ?? null,
    bids: currentState?.bids ?? [],
    hasSnapshot: currentState?.lot !== null && currentState?.lot !== undefined,
    connectionError: currentState?.connectionError ?? null,
  };
};
