type LotsPaginationProps = {
  page: number;
  totalPages: number;
  onPrevious: () => void;
  onNext: () => void;
};

export const LotsPagination = ({
  page,
  totalPages,
  onPrevious,
  onNext,
}: LotsPaginationProps) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginTop: '16px',
    }}
  >
    <button onClick={onPrevious} disabled={page === 1}>
      Prev
    </button>
    <span>
      Page {page} / {totalPages}
    </span>
    <button onClick={onNext} disabled={page >= totalPages}>
      Next
    </button>
  </div>
);
