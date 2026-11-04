import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { LotCard } from '../components/LotCard';
import type { LotDetails } from '../schemas/lots/lot-details.schema';
import lotsService from '../services/lotsService';

export const LotPage = () => {
  const { id } = useParams();
  const [result, setResult] = useState<{
    id: string;
    lot: LotDetails | null;
    error: string | null;
  } | null>(null);

  useEffect(() => {
    if (!id) {
      return;
    }

    const controller = new AbortController();

    const fetchLot = async () => {
      try {
        const result = await lotsService.getLotById(id, controller.signal);
        setResult({ id, lot: result, error: null });
      } catch (error) {
        if (!controller.signal.aborted) {
          setResult({
            id,
            lot: null,
            error:
              error instanceof Error ? error.message : 'Failed to fetch lot',
          });
        }
      }
    };

    void fetchLot();
    return () => controller.abort();
  }, [id]);

  const isLoading = Boolean(id) && result?.id !== id;
  const currentResult = result?.id === id ? result : null;
  const lot = currentResult?.lot ?? null;
  const error = !id
    ? 'Lot ID is missing.'
    : currentResult
      ? currentResult.error
      : null;

  return (
    <section>
      <p>
        <Link to="/lots">Back to lots</Link>
      </p>
      {isLoading && <p>Loading lot…</p>}
      {error && <p role="alert">{error}</p>}
      {!isLoading && !error && lot && <LotCard lot={lot} variant="details" />}
    </section>
  );
};
