import axios from 'axios';

/**
 * API clients for cross-service calls from the platform admin UI.
 * Each service has its own base URL configured via environment variables.
 */

function createServiceClient(baseURL: string) {
  const client = axios.create({
    baseURL,
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true,
  });

  client.interceptors.response.use(
    (response) => response,
    (error) => {
      const message = error.response?.data?.error || error.response?.data?.message || error.message || 'Service request failed';
      return Promise.reject(new Error(message));
    }
  );

  return client;
}

// Treasury API - payment gateways, analytics, payouts
export const treasuryApi = createServiceClient(
  process.env.NEXT_PUBLIC_TREASURY_API_URL || 'http://localhost:4201'
);

// Notifications API - providers, branding, templates
export const notificationsApi = createServiceClient(
  process.env.NEXT_PUBLIC_NOTIFICATIONS_API_URL || 'http://localhost:4301'
);

// Subscriptions API - plans, products, addons
export const subscriptionsApi = createServiceClient(
  process.env.NEXT_PUBLIC_SUBSCRIPTIONS_API_URL || 'http://localhost:4401'
);
