// Always use production SSO URL for API calls
// Local development should also connect to production auth-api for consistent behavior
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://sso.codevertexitsolutions.com';

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data as T;
}
