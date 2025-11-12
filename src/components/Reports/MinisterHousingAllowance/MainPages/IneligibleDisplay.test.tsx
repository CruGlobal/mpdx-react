import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { render } from '@testing-library/react';
import theme from 'src/theme';
import { PersonInfo, mocks } from '../Shared/mockData';
import { IneligibleDisplay } from './IneligibleDisplay';

const title = 'Test Title';

interface TestComponentProps {
  isMarried: boolean;
  spouse?: PersonInfo | null;
}

const TestComponent: React.FC<TestComponentProps> = ({ isMarried, spouse }) => (
  <ThemeProvider theme={theme}>
    <LocalizationProvider dateAdapter={AdapterLuxon}>
      <IneligibleDisplay
        title={title}
        isMarried={isMarried}
        staff={mocks[1].staffInfo}
        spouse={spouse}
      />
    </LocalizationProvider>
  </ThemeProvider>
);

describe('IneligibleDisplay', () => {
  it('should render page with single staff', () => {
    const { getByText, queryByText } = render(
      <TestComponent isMarried={false} />,
    );

    expect(getByText(title)).toBeInTheDocument();
    expect(
      getByText(
        /our records indicate that you have not applied for minister's housing allowance/i,
      ),
    ).toBeInTheDocument();
    expect(
      queryByText(/Jane has not completed the required ibs courses/i),
    ).not.toBeInTheDocument();
  });

  it('should render page with married staff', () => {
    const { getByText } = render(
      <TestComponent isMarried={true} spouse={mocks[1].spouseInfo} />,
    );

    expect(
      getByText(/Jane has not completed the required ibs courses/i),
    ).toBeInTheDocument();
  });
});
