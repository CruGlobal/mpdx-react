import dynamic from 'next/dynamic';
import { DynamicModalPlaceholder } from 'src/components/DynamicPlaceholders/DynamicModalPlaceholder';

export const preloadSendScenarioGoalDialog = () =>
  import(
    /* webpackChunkName: "SendScenarioGoalDialog" */ './SendScenarioGoalDialog'
  ).then(({ SendScenarioGoalDialog }) => SendScenarioGoalDialog);

export const DynamicSendScenarioGoalDialog = dynamic(
  preloadSendScenarioGoalDialog,
  { loading: DynamicModalPlaceholder },
);
