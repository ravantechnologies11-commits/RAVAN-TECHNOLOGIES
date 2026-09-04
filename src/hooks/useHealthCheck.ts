import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface HealthStatus {
  isConfigured: boolean;
  isChecking: boolean;
  tables: Record<string, boolean>;
  buckets: Record<string, boolean>;
  hasErrors: boolean;
  errorMessages: string[];
}

const REQUIRED_TABLES = [
  'site_settings',
  'leadership',
  'founders',
  'profiles'
];

const REQUIRED_BUCKETS = [
  'site-assets',
  'avatars'
];

export function useHealthCheck() {
  const [health, setHealth] = useState<HealthStatus>({
    isConfigured: isSupabaseConfigured,
    isChecking: true,
    tables: {},
    buckets: {},
    hasErrors: false,
    errorMessages: []
  });

  useEffect(() => {
    let mounted = true;

    async function performCheck() {
      if (!isSupabaseConfigured || !supabase) {
        if (mounted) {
          setHealth(prev => ({
            ...prev,
            isChecking: false,
            hasErrors: true,
            errorMessages: ['Supabase is not configured. Missing environment variables.']
          }));
        }
        return;
      }

      const newHealth = {
        isConfigured: true,
        isChecking: false,
        tables: {} as Record<string, boolean>,
        buckets: {} as Record<string, boolean>,
        hasErrors: false,
        errorMessages: [] as string[]
      };

      try {
        // 1. Check Tables
        for (const table of REQUIRED_TABLES) {
          const { error } = await supabase.from(table).select('id').limit(1);
          if (error && (error.code === '42P01' || error.message.includes('does not exist'))) {
            newHealth.tables[table] = false;
            newHealth.hasErrors = true;
            newHealth.errorMessages.push(`Database Table public.${table} not found.`);
          } else {
            newHealth.tables[table] = true;
          }
        }

        // 2. Check Buckets
        const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
        if (bucketsError) {
           newHealth.hasErrors = true;
           newHealth.errorMessages.push(`Storage check failed: ${bucketsError.message}`);
        } else {
          const bucketNames = buckets?.map(b => b.name) || [];
          for (const bucket of REQUIRED_BUCKETS) {
            if (!bucketNames.includes(bucket)) {
              newHealth.buckets[bucket] = false;
              newHealth.hasErrors = true;
              newHealth.errorMessages.push(`Storage bucket ${bucket} not found.`);
            } else {
              newHealth.buckets[bucket] = true;
            }
          }
        }
      } catch (err: any) {
        newHealth.hasErrors = true;
        newHealth.errorMessages.push(`Network or permission error: ${err.message}`);
      }

      if (mounted) {
        setHealth(newHealth);
      }
    }

    performCheck();

    return () => {
      mounted = false;
    };
  }, []);

  return health;
}
