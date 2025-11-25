export default function getErrorMessage(err: any): string {
  if (!err) return 'An unknown error occurred';

  // Axios-style response body
  const resp = err?.response?.data;
  if (resp?.message) return String(resp.message);
  if (resp?.error) return String(resp.error);

  // Direct string error
  if (typeof err === 'string') return err;

  // Standard Error
  if (err?.message) return String(err.message);

  return 'An unknown error occurred';
}
