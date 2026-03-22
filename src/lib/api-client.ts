import axios from 'axios';

// Always use production SSO API URL
// The auth-ui is a centralized SSO portal that should always talk to the production auth-api
// For local development testing, set NEXT_PUBLIC_API_URL=http://localhost:4101
const PRODUCTION_SSO_API = 'https://sso.codevertexitsolutions.com';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || PRODUCTION_SSO_API,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    // You can add logic here to attach tokens if needed
    // For SSO, we mostly rely on cookies (withCredentials: true)
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Public routes that should NOT redirect on 401
// These pages handle unauthenticated users gracefully
const PUBLIC_ROUTES = [
  '/',                // Landing page
  '/login',           // Login page
  '/signup',          // Signup page
  '/forgot-password', // Forgot password page
  '/reset-password',  // Reset password page
  '/status',          // Status page
  '/docs',            // Documentation
  '/pricing',         // Pricing page
];

// Check if current path is a public route
export const isPublicRoute = (pathname: string) => {
  return PUBLIC_ROUTES.some(route =>
    pathname === route || pathname.startsWith(route + '/')
  );
};

// Response interceptor for handling errors globally.
// Preserves the original AxiosError so callers can access response data (e.g. error codes, details).
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Only redirect to login for protected routes, not public pages.
      // Public pages (like /login) handle errors in their own catch blocks.
      if (typeof window !== 'undefined' && !isPublicRoute(window.location.pathname)) {
        window.location.href = `/login?return_to=${encodeURIComponent(window.location.pathname)}`;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
