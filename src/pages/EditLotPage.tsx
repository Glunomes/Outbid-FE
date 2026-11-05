import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { LotFormField } from '../components/LotFormField';
import type { LotDetails } from '../schemas/lots/lot-details.schema';
import {
  updateLotSchema,
  type UpdateLotInput,
  type UpdateLotRequest,
} from '../schemas/lots/update-lot.schema';
import { getAccessTokenUserId } from '../services/accessTokenStorage';
import lotsService from '../services/lotsService';

const formatDateTimeLocal = (date: string | null) => {
  if (!date) {
    return '';
  }

  const value = new Date(date);
  const pad = (part: number) => String(part).padStart(2, '0');
  const milliseconds = String(value.getMilliseconds()).padStart(3, '0');
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}T${pad(value.getHours())}:${pad(value.getMinutes())}:${pad(value.getSeconds())}.${milliseconds}`;
};

const EditLotPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lot, setLot] = useState<LotDetails | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UpdateLotInput, unknown, UpdateLotRequest>({
    resolver: zodResolver(updateLotSchema),
    defaultValues: {
      name: '',
      description: '',
      startingPrice: '',
      auctionStart: '',
      auctionEnd: '',
    },
  });

  useEffect(() => {
    if (!id) {
      return;
    }

    const controller = new AbortController();
    const loadLot = async () => {
      try {
        const result = await lotsService.getLotById(id, controller.signal);
        if (controller.signal.aborted) {
          return;
        }

        const owner = getAccessTokenUserId() === result.seller.id;
        setLot(result);
        setIsOwner(owner);
        if (owner) {
          reset({
            name: result.name,
            description: result.description ?? '',
            startingPrice: result.startingPrice,
            auctionStart: formatDateTimeLocal(result.auctionStart),
            auctionEnd: formatDateTimeLocal(result.auctionEnd),
          });
        }
      } catch (loadError) {
        if (!controller.signal.aborted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : 'Failed to load lot.',
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    void loadLot();
    return () => controller.abort();
  }, [id, reset]);

  const handleUpdateSubmit = async (data: UpdateLotRequest) => {
    if (!id) {
      setError('Lot ID is missing.');
      return;
    }

    try {
      setError('');
      await lotsService.updateLot(id, data);
      navigate(`/lots/${id}`, { replace: true });
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Failed to update lot.',
      );
    }
  };

  const canEdit = lot?.status === 'DRAFT' || lot?.status === 'SCHEDULED';
  const scheduled = lot?.status === 'SCHEDULED';

  return (
    <main>
      <h2>Edit lot</h2>
      <p>
        <Link to={id ? `/lots/${id}` : '/lots'}>Back to lot</Link>
      </p>
      {isLoading && id && <p>Loading lot…</p>}
      {!id && <p role="alert">Lot ID is missing.</p>}
      {!isLoading && !isOwner && !error && (
        <p role="alert">Only the lot owner can edit this lot.</p>
      )}
      {error && <p role="alert">{error}</p>}
      {isOwner && lot && !canEdit && (
        <p role="status">This lot can no longer be edited.</p>
      )}
      {isOwner && lot && canEdit && (
        <form onSubmit={handleSubmit(handleUpdateSubmit)} noValidate>
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
            step="0.001"
            registration={register('auctionStart')}
            error={errors.auctionStart?.message}
            readOnly={scheduled}
          />
          <LotFormField
            id="lot-auction-end"
            label="Auction end"
            type="datetime-local"
            step="0.001"
            registration={register('auctionEnd')}
            error={errors.auctionEnd?.message}
            readOnly={scheduled}
          />
          {scheduled && (
            <p role="status">
              A scheduled auction's dates cannot be changed.
            </p>
          )}
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving changes…' : 'Save changes'}
          </button>
        </form>
      )}
    </main>
  );
};

export default EditLotPage;
