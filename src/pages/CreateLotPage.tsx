import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { LotFormField } from '../components/LotFormField';
import {
  createLotSchema,
  type CreateLotInput,
} from '../schemas/lots/create-lot.schema';
import lotsService from '../services/lotsService';

export const CreateLotPage = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateLotInput>({
    resolver: zodResolver(createLotSchema),
    defaultValues: {
      name: '',
      startingPrice: '',
      description: '',
    },
  });

  const handleCreateSubmit = async (data: CreateLotInput) => {
    try {
      setError('');
      const lot = await lotsService.createLot(data);
      reset();
      navigate(`/lots/${lot.id}`, { replace: true });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Something went wrong');
    }
  };

  const registerAuctionDate = (field: 'auctionStart' | 'auctionEnd') =>
    register(field, {
      setValueAs: (value: unknown) =>
        typeof value === 'string' && value
          ? new Date(value).toISOString()
          : undefined,
    });

  return (
    <main>
      <h2>Create a lot</h2>
      {error && <p role="alert">{error}</p>}
      <form onSubmit={handleSubmit(handleCreateSubmit)} noValidate>
        <LotFormField
          id="lot-name"
          label="Name"
          registration={register('name')}
          error={errors.name?.message}
        />
        <LotFormField
          id="lot-description"
          label="Description"
          registration={register('description')}
          error={errors.description?.message}
          multiline
        />
        <LotFormField
          id="lot-starting-price"
          label="Starting price"
          inputMode="decimal"
          registration={register('startingPrice')}
          error={errors.startingPrice?.message}
        />
        <LotFormField
          id="lot-auction-start"
          label="Auction start"
          type="datetime-local"
          registration={registerAuctionDate('auctionStart')}
          error={errors.auctionStart?.message}
        />
        <LotFormField
          id="lot-auction-end"
          label="Auction end"
          type="datetime-local"
          registration={registerAuctionDate('auctionEnd')}
          error={errors.auctionEnd?.message}
        />
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating lot…' : 'Create lot'}
        </button>
      </form>
    </main>
  );
};
