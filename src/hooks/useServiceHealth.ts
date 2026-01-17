import { Service, ServiceStatus, SERVICES } from '@/config/services';
import { useEffect, useState } from 'react';

export type { ServiceStatus } from '@/config/services';

export interface ServiceHealthResult {
  id: string;
  status: ServiceStatus;
  responseTime?: number;
  lastChecked: string;
  error?: string;
}

export interface HealthResponse {
  services: ServiceHealthResult[];
  checkedAt: string;
}

export interface ServiceWithHealth extends Service {
  dynamicStatus?: ServiceStatus;
  responseTime?: number;
  lastChecked?: string;
  healthError?: string;
}

export function useServiceHealth() {
  const [healthData, setHealthData] = useState<HealthResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const response = await fetch('/api/health');
        if (!response.ok) throw new Error('Failed to fetch health status');
        const data = await response.json();
        setHealthData(data);
        setError(null);
      } catch (err) {
        setError('Unable to fetch service health');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHealth();
  }, []);

  // Merge static service config with dynamic health data
  const servicesWithHealth: ServiceWithHealth[] = SERVICES.map((service) => {
    const healthResult = healthData?.services.find((h) => h.id === service.id);

    if (healthResult) {
      return {
        ...service,
        // Use dynamic status if available, otherwise keep static
        status: healthResult.status,
        dynamicStatus: healthResult.status,
        responseTime: healthResult.responseTime,
        lastChecked: healthResult.lastChecked,
        healthError: healthResult.error,
      };
    }

    return service as ServiceWithHealth;
  });

  const getServiceWithHealth = (id: string): ServiceWithHealth | undefined => {
    return servicesWithHealth.find((s) => s.id === id);
  };

  const getLiveServicesWithHealth = (): ServiceWithHealth[] => {
    return servicesWithHealth.filter((s) => s.status === 'live');
  };

  const getServicesByStatusWithHealth = (
    status: ServiceStatus
  ): ServiceWithHealth[] => {
    return servicesWithHealth.filter((s) => s.status === status);
  };

  return {
    services: servicesWithHealth,
    healthData,
    isLoading,
    error,
    getServiceWithHealth,
    getLiveServicesWithHealth,
    getServicesByStatusWithHealth,
  };
}
