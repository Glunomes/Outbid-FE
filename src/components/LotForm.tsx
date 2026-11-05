import type { FormEventHandler } from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';
import { FormField } from './FormField';

type LotFieldName =
  'name' | 'description' | 'startingPrice' | 'auctionStart' | 'auctionEnd';

type LotFormProps = {
  register: Record<LotFieldName, UseFormRegisterReturn>;
  errors: Partial<Record<LotFieldName, string | undefined>>;
  onSubmit: FormEventHandler<HTMLFormElement>;
  isSubmitting: boolean;
  submitLabel: string;
  submittingLabel: string;
  dateStep?: string;
  scheduleReadOnly?: boolean;
  scheduleMessage?: string;
};

export const LotForm = ({
  register,
  errors,
  onSubmit,
  isSubmitting,
  submitLabel,
  submittingLabel,
  dateStep = '60',
  scheduleReadOnly = false,
  scheduleMessage,
}: LotFormProps) => (
  <form onSubmit={onSubmit} noValidate>
    <FormField
      id="lot-name"
      label="Name"
      registration={register.name}
      error={errors.name}
    />
    <FormField
      id="lot-description"
      label="Description"
      registration={register.description}
      error={errors.description}
      multiline
    />
    <FormField
      id="lot-starting-price"
      label="Starting price"
      inputMode="decimal"
      registration={register.startingPrice}
      error={errors.startingPrice}
    />
    <FormField
      id="lot-auction-start"
      label="Auction start"
      type="datetime-local"
      step={dateStep}
      registration={register.auctionStart}
      error={errors.auctionStart}
      readOnly={scheduleReadOnly}
    />
    <FormField
      id="lot-auction-end"
      label="Auction end"
      type="datetime-local"
      step={dateStep}
      registration={register.auctionEnd}
      error={errors.auctionEnd}
      readOnly={scheduleReadOnly}
    />
    {scheduleMessage && <p role="status">{scheduleMessage}</p>}
    <button type="submit" disabled={isSubmitting}>
      {isSubmitting ? submittingLabel : submitLabel}
    </button>
  </form>
);
