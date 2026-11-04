import type { LotDetails } from '../schemas/lots/lot-details.schema';
import type { LotCatalogItem } from '../schemas/lots/lots-catalog.schema';

type LotCardProps =
  | { lot: LotCatalogItem; variant?: 'catalog' }
  | { lot: LotDetails; variant: 'details' };

const formatDate = (date: string | null) =>
  date ? new Date(date).toLocaleString() : 'Not scheduled';

export const LotCard = (props: LotCardProps) => {
  const isDetails = props.variant === 'details';
  const lot = props.lot;
  const price = isDetails
    ? (props.lot.currentPrice ?? props.lot.startingPrice)
    : props.lot.price;

  return (
    <article>
      <h2>{lot.name}</h2>
      {lot.description && <p>{lot.description}</p>}
      <p>Price: {price}</p>
      <p>Status: {lot.status}</p>
      <p>
        Starts:{' '}
        <time dateTime={lot.auctionStart ?? undefined}>
          {formatDate(lot.auctionStart)}
        </time>
      </p>
      <p>
        Ends:{' '}
        <time dateTime={lot.auctionEnd ?? undefined}>
          {formatDate(lot.auctionEnd)}
        </time>
      </p>
      {isDetails && <p>Seller: {props.lot.seller.name}</p>}
    </article>
  );
};
