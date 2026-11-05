import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { LotForm } from '../components/LotForm';
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
      <LotForm
        register={{
          name: register('name'),
          description: register('description'),
          startingPrice: register('startingPrice'),
          auctionStart: registerAuctionDate('auctionStart'),
          auctionEnd: registerAuctionDate('auctionEnd'),
        }}
        errors={{
          name: errors.name?.message,
          description: errors.description?.message,
          startingPrice: errors.startingPrice?.message,
          auctionStart: errors.auctionStart?.message,
          auctionEnd: errors.auctionEnd?.message,
        }}
        onSubmit={handleSubmit(handleCreateSubmit)}
        isSubmitting={isSubmitting}
        submitLabel="Create lot"
        submittingLabel="Creating lot…"
      />
    </main>
  );
};
