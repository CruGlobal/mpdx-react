import React, { createContext, memo, useEffect, useState } from 'react';
import { useOptionalAccountListId } from 'src/hooks/useAccountListId';
import {
  NavigationVisibilityResult,
  useNavigationVisibility,
} from './useNavigationVisibility';

// Null until the lookup runs, so cards show plain text instead of guessing
export const NavigationVisibilityContext =
  createContext<NavigationVisibilityResult | null>(null);

interface LoaderProps {
  onChange: (result: NavigationVisibilityResult) => void;
}

const VisibilityQuery: React.FC<LoaderProps> = ({ onChange }) => {
  const result = useNavigationVisibility();
  useEffect(() => onChange(result), [onChange, result]);
  return null;
};

// Pages without an account list also lack the GraphQL client the visibility hook needs
const VisibilityLoader = memo<LoaderProps>(function VisibilityLoader({
  onChange,
}) {
  return useOptionalAccountListId() ? (
    <VisibilityQuery onChange={onChange} />
  ) : null;
});

interface NavigationVisibilityProviderProps {
  enabled: boolean;
  children: React.ReactNode;
}

// A sibling loader keeps the list mounted as the lookup starts and stops
export const NavigationVisibilityProvider: React.FC<
  NavigationVisibilityProviderProps
> = ({ enabled, children }) => {
  const [result, setResult] = useState<NavigationVisibilityResult | null>(null);

  return (
    <NavigationVisibilityContext.Provider value={result}>
      {enabled && <VisibilityLoader onChange={setResult} />}
      {children}
    </NavigationVisibilityContext.Provider>
  );
};
