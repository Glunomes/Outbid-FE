import { useEffect, useState } from 'react';
import type { LotDetails } from '../schemas/lots/lot-details.schema';
import lotsService from '../services/lotsService';

const STATUS_RECHECK_INTERVAL_MS = 5_000;
const MAX_TIMEOUT_MS = 2_147_000_000;

type StatusCheckError = {
  lotId: string;
  message: string;
};

type UseLotStatusCheckOptions = {
  lotId: string | undefined;
  lot: LotDetails | null;
  onLotRefresh: (lot: LotDetails) => void;
};

export const useLotStatusCheck = ({
  lotId,
  lot,
  onLotRefresh,
}: UseLotStatusCheckOptions) => {
  const [error, setError] = useState<StatusCheckError | null>(null);

  useEffect(() => {
    if (!lotId || lot?.status !== 'ACTIVE' || !lot.auctionEnd) {
      return;
    }

    const auctionEnd = Date.parse(lot.auctionEnd);
    if (Number.isNaN(auctionEnd)) {
      return;
    }

    let timer: number | undefined;
    let controller: AbortController | undefined;

    const checkStatus = async () => {
      if (Date.now() < auctionEnd) {
        timer = window.setTimeout(
          () => void checkStatus(),
          Math.min(auctionEnd - Date.now(), MAX_TIMEOUT_MS),
        );
        return;
      }

      controller = new AbortController();
      try {
        const updatedLot = await lotsService.getLotById(
          lotId,
          controller.signal,
        );
        onLotRefresh(updatedLot);
        setError(null);

        if (
          updatedLot.status === 'ACTIVE' &&
          updatedLot.auctionEnd &&
          Date.parse(updatedLot.auctionEnd) <= Date.now()
        ) {
          timer = window.setTimeout(
            () => void checkStatus(),
            STATUS_RECHECK_INTERVAL_MS,
          );
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setError({
            lotId,
            message:
              error instanceof Error
                ? error.message
                : 'Could not verify the auction status.',
          });
          timer = window.setTimeout(
            () => void checkStatus(),
            STATUS_RECHECK_INTERVAL_MS,
          );
        }
      }
    };

    void checkStatus();

    return () => {
      if (timer !== undefined) {
        window.clearTimeout(timer);
      }
      controller?.abort();
    };
  }, [lotId, lot?.auctionEnd, lot?.status, onLotRefresh]);

  return error && error.lotId === lotId ? error.message : null;
};
