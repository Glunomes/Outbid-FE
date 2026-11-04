import { useEffect, useState } from 'react';
import { LotCard } from '../components/LotCard';
import lotsService from '../services/lotsService';
import type { LotCatalogItem } from '../schemas/lots/lots-catalog.schema';

export const LotsCatalogPage = () => {
  const [lots, setLots] = useState<LotCatalogItem[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchLots = async () => {
      try {
        const result = await lotsService.getLots();
        if (isMounted) {
          setLots(result.lots);
        }
      } catch (error) {
        if (isMounted) {
          setError(
            error instanceof Error ? error.message : 'Failed to fetch lots',
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void fetchLots();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section>
      <h2>Lots</h2>
      {isLoading && <p>Loading lots…</p>}
      {error && <p role="alert">{error}</p>}
      {!isLoading && !error && lots.length === 0 && <p>No lots found.</p>}
      <ul>
        {lots.map((lot) => (
          <li key={lot.id}>
            <LotCard lot={lot} />
          </li>
        ))}
      </ul>
    </section>
  );
};
