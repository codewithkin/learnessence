import axios from 'axios';

const isServer = typeof window === 'undefined';

// Use server env var on server, and NEXT_PUBLIC variant on client
const baseURL = isServer
  ? (process.env.BETTER_AUTH_URL ?? '')
  : (process.env.NEXT_PUBLIC_BETTER_AUTH_URL ?? '');

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
