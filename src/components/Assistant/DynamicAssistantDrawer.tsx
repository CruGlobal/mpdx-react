import dynamic from 'next/dynamic';
import React, { useEffect, useState } from 'react';
import { DynamicModalPlaceholder } from 'src/components/DynamicPlaceholders/DynamicModalPlaceholder';
import { useAssistantContext } from './AssistantProvider';

export const preloadAssistantDrawer = () =>
  import(/* webpackChunkName: "AssistantDrawer" */ './AssistantDrawer').then(
    ({ AssistantDrawer }) => AssistantDrawer,
  );

const LazyAssistantDrawer = dynamic(preloadAssistantDrawer, {
  loading: DynamicModalPlaceholder,
});

// Defer loading the chunk until the first open so the placeholder never flashes on page load
export const DynamicAssistantDrawer: React.FC = () => {
  const { open } = useAssistantContext();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (open) {
      setLoaded(true);
    }
  }, [open]);

  return loaded ? <LazyAssistantDrawer /> : null;
};
