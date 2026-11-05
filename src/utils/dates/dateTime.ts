export const formatDateTime = (date: string | null): string => {
  if (!date) {
    return 'Not scheduled';
  }

  const parsedDate = new Date(date);
  return Number.isNaN(parsedDate.getTime())
    ? 'Not scheduled'
    : parsedDate.toLocaleString();
};

export const toLocalDateTimeInput = (date: string | null): string => {
  if (!date) {
    return '';
  }

  const value = new Date(date);
  if (Number.isNaN(value.getTime())) {
    return '';
  }

  const pad = (part: number) => String(part).padStart(2, '0');
  const milliseconds = String(value.getMilliseconds()).padStart(3, '0');
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}T${pad(value.getHours())}:${pad(value.getMinutes())}:${pad(value.getSeconds())}.${milliseconds}`;
};
