import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import type { AuctionStatus } from '../schemas/lots/lots-catalog.schema';
import bidsService from '../services/bidsService';
import { formatCents, parseAmountToCents } from '../utils/bids/amount';
import { makeBidRequestSchema } from '../schemas/bids/make-bid.schema';

type BidFormProps = {
  lotId: string;
  isAuthenticated: boolean;
  status: AuctionStatus;
  currentPrice: string;
  auctionEnd: string | null;
};

const MAX_TIMEOUT_MS = 2_147_000_000;

export const BidForm = ({
  lotId,
  isAuthenticated,
  status,
  currentPrice,
  auctionEnd,
}: BidFormProps) => {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expiredAuctionEnd, setExpiredAuctionEnd] = useState<string | null>(
    null,
  );
  const currentPriceCents = parseAmountToCents(currentPrice);
  const minimumBidCents =
    currentPriceCents === null ? null : currentPriceCents + 1n;
  const minimumBid =
    minimumBidCents === null ? null : formatCents(minimumBidCents);
  const hasValidAuctionEnd = Boolean(
    auctionEnd && !Number.isNaN(Date.parse(auctionEnd)),
  );
  const hasAuctionEnded = Boolean(
    auctionEnd && expiredAuctionEnd === auctionEnd,
  );
  const isAuctionOpen =
    status === 'ACTIVE' && hasValidAuctionEnd && !hasAuctionEnded;

  useEffect(() => {
    if (!auctionEnd || Number.isNaN(Date.parse(auctionEnd))) {
      return;
    }

    let timer: number | undefined;
    const updateExpiry = () => {
      const remaining = Date.parse(auctionEnd) - Date.now();
      if (remaining <= 0) {
        setExpiredAuctionEnd(auctionEnd);
        return;
      }

      timer = window.setTimeout(
        updateExpiry,
        Math.min(remaining, MAX_TIMEOUT_MS),
      );
    };

    timer = window.setTimeout(updateExpiry, 0);
    return () => {
      if (timer !== undefined) {
        window.clearTimeout(timer);
      }
    };
  }, [auctionEnd]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    const auctionHasExpired =
      auctionEnd !== null && Date.parse(auctionEnd) <= Date.now();
    if (!isAuctionOpen || auctionHasExpired) {
      if (auctionHasExpired && auctionEnd) {
        setExpiredAuctionEnd(auctionEnd);
      }
      setError(
        status !== 'ACTIVE'
          ? 'This auction is not active.'
          : hasAuctionEnded || auctionHasExpired
            ? 'This auction has ended.'
            : 'The auction end time is unavailable.',
      );
      return;
    }

    const parsedRequest = makeBidRequestSchema.safeParse({ amount });
    if (!parsedRequest.success) {
      setError(parsedRequest.error.issues[0]?.message ?? 'Enter a valid bid.');
      return;
    }

    const bidCents = parseAmountToCents(parsedRequest.data.amount);
    if (minimumBidCents === null || bidCents === null) {
      setError('The current price is invalid. Please reload the lot.');
      return;
    }
    if (bidCents < minimumBidCents) {
      setError(`Your bid must be at least ${formatCents(minimumBidCents)}.`);
      return;
    }

    try {
      setIsSubmitting(true);
      const result = await bidsService.makeBid(lotId, parsedRequest.data);
      const acceptedPrice = parseAmountToCents(result.currentPrice);
      const nextMinimum =
        acceptedPrice === null ? null : formatCents(acceptedPrice + 1n);
      setAmount('');
      setSuccess(
        nextMinimum
          ? `Bid placed successfully. Current price: ${result.currentPrice}. Minimum next bid: ${nextMinimum}.`
          : `Bid placed successfully. Current price: ${result.currentPrice}.`,
      );
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to place bid.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <p>
        <Link to="/auth/login">Sign in</Link> to place a bid.
      </p>
    );
  }

  return (
    <section aria-labelledby="place-bid-heading">
      <h2 id="place-bid-heading">Place a bid</h2>
      {minimumBid && <p>Minimum bid: {minimumBid}</p>}
      {!minimumBid && (
        <p role="alert">Could not determine the minimum bid for this lot.</p>
      )}
      {!isAuctionOpen && (
        <p role="status">
          {status !== 'ACTIVE'
            ? 'Bidding is not available for this auction.'
            : hasAuctionEnded
              ? 'This auction has ended.'
              : 'The auction end time is unavailable.'}
        </p>
      )}
      {error && (
        <p id="bid-amount-error" role="alert">
          {error}
        </p>
      )}
      {success && <p role="status">{success}</p>}
      <form onSubmit={handleSubmit} noValidate>
        <label htmlFor="bid-amount">Your bid</label>
        <input
          id="bid-amount"
          type="text"
          inputMode="decimal"
          value={amount}
          onChange={(event) => {
            setAmount(event.target.value);
            setError('');
            setSuccess('');
          }}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? 'bid-amount-error' : undefined}
          disabled={!isAuctionOpen || minimumBidCents === null || isSubmitting}
        />
        <button
          type="submit"
          disabled={
            !isAuctionOpen ||
            minimumBidCents === null ||
            !amount ||
            isSubmitting
          }
        >
          {isSubmitting ? 'Placing bid…' : 'Place bid'}
        </button>
      </form>
    </section>
  );
};
