import { useRequiredSession } from './useRequiredSession';

// When not in production, developers bypass all eligibility gating so they can reach all pages
export function useDeveloperBypass(): boolean {
  const { developer } = useRequiredSession();
  return process.env.DEVELOPMENT_ENV === 'true' && developer;
}
