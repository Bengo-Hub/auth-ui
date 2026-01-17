import { NextResponse } from 'next/server';

// Service health configuration mapping service IDs to their health endpoints
const SERVICE_HEALTH_CONFIG: Record<string, { url: string; healthPath: string }> = {
  cafe: {
    url: 'https://cafe.codevertexitsolutions.com',
    healthPath: '/',
  },
  ordering: {
    url: 'https://ordersapp.codevertexitsolutions.com',
    healthPath: '/healthz',
  },
  pos: {
    url: 'https://pos.codevertexitsolutions.com',
    healthPath: '/healthz',
  },
  logistics: {
    url: 'https://logistics.codevertexitsolutions.com',
    healthPath: '/healthz',
  },
  inventory: {
    url: 'https://inventory.codevertexitsolutions.com',
    healthPath: '/healthz',
  },
  books: {
    url: 'https://books.codevertexitsolutions.com',
    healthPath: '/healthz',
  },
  erp: {
    url: 'https://erp.masterspace.co.ke',
    healthPath: '/',
  },
  projects: {
    url: 'https://projects.codevertexitsolutions.com',
    healthPath: '/healthz',
  },
  ticketing: {
    url: 'https://ticketing.codevertexitsolutions.com',
    healthPath: '/healthz',
  },
  isp: {
    url: 'https://ispbilling.codevertexitsolutions.com',
    healthPath: '/healthz',
  },
  truload: {
    url: 'https://truloadtest.masterspace.co.ke',
    healthPath: '/',
  },
};

export type ServiceStatus = 'live' | 'beta' | 'coming-soon' | 'offline';

export interface ServiceHealthResult {
  id: string;
  status: ServiceStatus;
  responseTime?: number;
  lastChecked: string;
  error?: string;
}

async function checkServiceHealth(
  id: string,
  config: { url: string; healthPath: string }
): Promise<ServiceHealthResult> {
  const startTime = Date.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

  try {
    const response = await fetch(`${config.url}${config.healthPath}`, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Codevertex-Health-Probe/1.0',
      },
    });

    clearTimeout(timeoutId);
    const responseTime = Date.now() - startTime;

    if (response.ok) {
      // Check if this is a beta service based on response headers or path
      const isBeta = response.headers.get('X-Service-Stage') === 'beta';
      return {
        id,
        status: isBeta ? 'beta' : 'live',
        responseTime,
        lastChecked: new Date().toISOString(),
      };
    } else if (response.status === 503) {
      return {
        id,
        status: 'coming-soon',
        responseTime,
        lastChecked: new Date().toISOString(),
      };
    } else {
      return {
        id,
        status: 'offline',
        responseTime,
        lastChecked: new Date().toISOString(),
        error: `HTTP ${response.status}`,
      };
    }
  } catch (error: any) {
    clearTimeout(timeoutId);

    // If timeout or network error, mark as coming-soon (not yet deployed)
    if (error.name === 'AbortError') {
      return {
        id,
        status: 'coming-soon',
        lastChecked: new Date().toISOString(),
        error: 'Timeout',
      };
    }

    // For other network errors, could be DNS not resolving (not deployed)
    return {
      id,
      status: 'coming-soon',
      lastChecked: new Date().toISOString(),
      error: error.message || 'Network error',
    };
  }
}

export async function GET() {
  const results: ServiceHealthResult[] = [];

  // Check all services in parallel
  const healthChecks = Object.entries(SERVICE_HEALTH_CONFIG).map(
    async ([id, config]) => {
      const result = await checkServiceHealth(id, config);
      results.push(result);
    }
  );

  await Promise.all(healthChecks);

  // Cache the response for 5 minutes
  return NextResponse.json(
    {
      services: results,
      checkedAt: new Date().toISOString(),
    },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    }
  );
}
