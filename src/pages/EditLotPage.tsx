import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { LotForm } from '../components/LotForm';
import type { LotDetails } from '../schemas/lots/lot-details.schema';
import {
  updateLotSchema,
  type UpdateLotInput,
  type UpdateLotRequest,
} from '../schemas/lots/update-lot.schema';
import { getAccessTokenUserId } from '../services/accessTokenStorage';
import lotsService from '../services/lotsService';
import { toLocalDateTimeInput } from '../utils/dates/dateTime';

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
            auctionStart: toLocalDateTimeInput(result.auctionStart),
            auctionEnd: toLocalDateTimeInput(result.auctionEnd),
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
        <LotForm
          register={{
            name: register('name'),
            description: register('description'),
            startingPrice: register('startingPrice'),
            auctionStart: register('auctionStart'),
            auctionEnd: register('auctionEnd'),
          }}
          errors={{
            name: errors.name?.message,
            description: errors.description?.message,
            startingPrice: errors.startingPrice?.message,
            auctionStart: errors.auctionStart?.message,
            auctionEnd: errors.auctionEnd?.message,
          }}
          onSubmit={handleSubmit(handleUpdateSubmit)}
          isSubmitting={isSubmitting}
          submitLabel="Save changes"
          submittingLabel="Saving changes…"
          dateStep="0.001"
          scheduleReadOnly={scheduled}
          scheduleMessage={
            scheduled
              ? "A scheduled auction's dates cannot be changed."
              : undefined
          }
        />
      )}
    </main>
  );
};

export default EditLotPage;
