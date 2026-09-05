import { useState, useEffect, useCallback } from 'react';

interface UseApiQueryOptions<T> {
  enabled?: boolean;
  initialData?: T;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

export function useApiQuery<T>(
  queryFn: () => Promise<T>,
  deps: any[] = [],
  options: UseApiQueryOptions<T> = {}
) {
  const { enabled = true, initialData, onSuccess, onError } = options;
  const [data, setData] = useState<T | undefined>(initialData);
  const [isLoading, setIsLoading] = useState<boolean>(enabled);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await queryFn();
      setData(result);
      if (onSuccess) onSuccess(result);
      return result;
    } catch (err: any) {
      const errorObj = err instanceof Error ? err : new Error(String(err));
      setError(errorObj);
      if (onError) onError(errorObj);
      throw errorObj;
    } finally {
      setIsLoading(false);
    }
  }, [queryFn, onSuccess, onError]);

  useEffect(() => {
    if (enabled) {
      refetch().catch(() => {});
    }
  }, [enabled, ...deps]);

  return { data, isLoading, error, refetch, setData };
}

export function useApiMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: {
    onSuccess?: (data: TData, variables: TVariables) => void;
    onError?: (error: Error, variables: TVariables) => void;
  } = {}
) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<TData | undefined>(undefined);

  const mutate = async (variables: TVariables): Promise<TData> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await mutationFn(variables);
      setData(result);
      if (options.onSuccess) options.onSuccess(result, variables);
      return result;
    } catch (err: any) {
      const errorObj = err instanceof Error ? err : new Error(String(err));
      setError(errorObj);
      if (options.onError) options.onError(errorObj, variables);
      throw errorObj;
    } finally {
      setIsLoading(false);
    }
  };

  return { mutate, isLoading, error, data };
}
