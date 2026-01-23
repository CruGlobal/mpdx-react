import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { Settings } from 'luxon';
import { render } from '__tests__/util/testingLibraryReactMock';
import theme from 'src/theme';
import { SavingStatus } from './SavingStatus';

const lastSavedAt = '2024-01-15T15:11:38-05:00';

interface TestComponentProps {
  loading: boolean;
  hasData: boolean;
  isMutating: boolean;
  lastSavedAt: string | null;
}

const TestComponent: React.FC<TestComponentProps> = ({
  loading,
  hasData,
  isMutating,
  lastSavedAt,
}) => (
  <ThemeProvider theme={theme}>
    <LocalizationProvider dateAdapter={AdapterLuxon}>
      <SavingStatus
        loading={loading}
        hasData={hasData}
        isMutating={isMutating}
        lastSavedAt={lastSavedAt}
      />
    </LocalizationProvider>
  </ThemeProvider>
);

describe('SavingStatus', () => {
  beforeEach(() => {
    Settings.now = () => Date.parse('2024-01-15T15:26:38-05:00');
  });

  it('renders loading', () => {
    const { getByText } = render(
      <TestComponent
        loading={true}
        hasData={false}
        isMutating={false}
        lastSavedAt={null}
      />,
    );
    expect(getByText('Loading')).toBeInTheDocument();
  });

  it('renders saving', () => {
    const { getByText } = render(
      <TestComponent
        loading={false}
        hasData={true}
        isMutating={true}
        lastSavedAt={lastSavedAt}
      />,
    );
    expect(getByText('Saving')).toBeInTheDocument();
  });

  it('renders last saved at', () => {
    const { getByText } = render(
      <TestComponent
        loading={false}
        hasData={true}
        isMutating={false}
        lastSavedAt={lastSavedAt}
      />,
    );
    expect(getByText('Last saved 15 minutes ago')).toBeInTheDocument();
  });
});
