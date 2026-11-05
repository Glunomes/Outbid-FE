import { useState, type FormEvent } from 'react';
import {
  walletDepositSchema,
  type WalletResponse,
} from '../schemas/wallets/wallet.schema';
import walletsService from '../services/walletsService';
import { FormField } from './FormField';

type WalletDepositFormProps = {
  onWalletUpdated: (wallet: WalletResponse) => void;
};

export const WalletDepositForm = ({
  onWalletUpdated,
}: WalletDepositFormProps) => {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setMessage('');

    const parsedAmount = walletDepositSchema.safeParse({ amount });
    if (!parsedAmount.success) {
      setError(
        parsedAmount.error.issues[0]?.message ?? 'Enter a valid amount.',
      );
      return;
    }

    try {
      setIsSubmitting(true);
      const wallet = await walletsService.depositToMyWallet(parsedAmount.data);
      onWalletUpdated(wallet);
      setAmount('');
      setMessage(
        'Virtual funds added. This is not a payment and no money was charged.',
      );
    } catch (depositFailure) {
      setError(
        depositFailure instanceof Error
          ? depositFailure.message
          : 'Failed to add virtual funds.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <h3>Add virtual funds</h3>
      <p>
        Demo balance only. This adds virtual funds and is not a payment; no
        money will be charged.
      </p>
      <FormField
        id="wallet-deposit-amount"
        label="Amount"
        inputMode="decimal"
        error={error}
        value={amount}
        onChange={(event) => {
          setAmount(event.target.value);
          setError('');
          setMessage('');
        }}
        disabled={isSubmitting}
      />
      {message && <p role="status">{message}</p>}
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Adding virtual funds…' : 'Add virtual funds'}
      </button>
    </form>
  );
};
