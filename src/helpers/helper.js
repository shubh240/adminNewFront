export function formatToIST(utcDateStr) {
  const date = new Date(utcDateStr);

  // Convert to IST (UTC +5:30)
  const options = {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  };

  return date.toLocaleString('en-IN', options);
}

export function formatToISTOnlyDate(utcDateStr) {
  const date = new Date(utcDateStr);

  // Convert to IST (UTC +5:30)
  const options = {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  };

  return date.toLocaleString('en-IN', options);
}

export const getStatusClass = (status) => {
  switch (status) {
    case 'Success':
      return 'badge-outline-success';
    case 'Pending':
      return 'badge-outline-warning';
    case 'Failed':
      return 'badge-outline-danger';
    default:
      return 'badge-outline-secondary';
  }
};
