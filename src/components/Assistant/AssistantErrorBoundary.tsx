import React, { ReactNode } from 'react';
import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

const Fallback: React.FC = () => {
  const { t } = useTranslation();
  return (
    <Typography variant="body2" color="error">
      {t('Something went wrong showing this reply.')}
    </Typography>
  );
};

interface AssistantErrorBoundaryProps {
  children: ReactNode;
}

interface AssistantErrorBoundaryState {
  hasError: boolean;
}

export class AssistantErrorBoundary extends React.Component<
  AssistantErrorBoundaryProps,
  AssistantErrorBoundaryState
> {
  state: AssistantErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): AssistantErrorBoundaryState {
    return { hasError: true };
  }

  render(): ReactNode {
    return this.state.hasError ? <Fallback /> : this.props.children;
  }
}
