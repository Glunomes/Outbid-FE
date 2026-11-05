import { Link } from 'react-router-dom';
import type { LotDetails } from '../schemas/lots/lot-details.schema';
import type { LotCatalogItem } from '../schemas/lots/lots-catalog.schema';
import { formatDateTime } from '../utils/dates/dateTime';

type LotCardProps =
  | { lot: LotCatalogItem; variant?: 'catalog' }
  | { lot: LotDetails; variant: 'details' };

export const LotCard = (props: LotCardProps) => {
  const isDetails = props.variant === 'details';
  const lot = props.lot;
  const price = isDetails
    ? (props.lot.currentPrice ?? props.lot.startingPrice)
    : props.lot.price;

  return (
    <article>
      <h2>
        {isDetails ? lot.name : <Link to={`/lots/${lot.id}`}>{lot.name}</Link>}
      </h2>
      {lot.description && <p>{lot.description}</p>}
      <p>Price: {price}</p>
      <p>Status: {lot.status}</p>
      <p>
        Starts:{' '}
        <time dateTime={lot.auctionStart ?? undefined}>
          {formatDateTime(lot.auctionStart)}
        </time>
      </p>
      <p>
        Ends:{' '}
        <time dateTime={lot.auctionEnd ?? undefined}>
          {formatDateTime(lot.auctionEnd)}
        </time>
      </p>
      {isDetails && <p>Seller: {props.lot.seller.name}</p>}
    </article>
  );
};
