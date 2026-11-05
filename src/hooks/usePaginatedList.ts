import { useEffect, useState } from 'react';

export const PAGE_SIZE = 10;

export type PaginatedListPage<Item> = {
  lots: Item[];
  totalPages: number;
};

type PageLoader<Item> = (
  page: number,
  signal: AbortSignal,
) => Promise<PaginatedListPage<Item>>;

type UsePaginatedListOptions<Item> = {
  page: number;
  loadPage: PageLoader<Item>;
  enabled?: boolean;
  errorFallback: string;
};

export const usePaginatedList = <Item>({
  page,
  loadPage,
  enabled = true,
  errorFallback,
}: UsePaginatedListOptions<Item>) => {
  const [lots, setLots] = useState<Item[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(enabled);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const controller = new AbortController();
    const fetchPage = async () => {
      try {
        setIsLoading(true);
        setError('');
        const result = await loadPage(page, controller.signal);
        if (!controller.signal.aborted) {
          setLots(result.lots);
          setTotalPages(result.totalPages);
        }
      } catch (loadError) {
        if (!controller.signal.aborted) {
          setError(
            loadError instanceof Error ? loadError.message : errorFallback,
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    void fetchPage();
    return () => controller.abort();
  }, [enabled, errorFallback, loadPage, page]);

  return { lots, totalPages, error, isLoading };
};
