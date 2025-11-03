import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import TestRouter from '__tests__/util/TestRouter';
import theme from 'src/theme';
import { DirectionButtons } from './DirectionButtons';

const handleNext = jest.fn();
const accountListId = 'account-list-id';

const TestComponent: React.FC = () => (
  <ThemeProvider theme={theme}>
    <TestRouter router={{ query: { accountListId } }}>
      <DirectionButtons handleNext={handleNext} />
    </TestRouter>
  </ThemeProvider>
);

describe('DirectionButtons', () => {
  it('renders Cancel and Continue buttons', () => {
    const { getByRole } = render(<TestComponent />);

    expect(getByRole('link', { name: 'CANCEL' })).toBeInTheDocument();
    expect(getByRole('button', { name: 'CONTINUE' })).toBeInTheDocument();
  });

  it('calls handleNext when Continue is clicked', () => {
    const { getByRole } = render(<TestComponent />);

    const continueButton = getByRole('button', { name: 'CONTINUE' });
    continueButton.click();

    expect(handleNext).toHaveBeenCalled();
  });

  it('navigates to the correct URL when Cancel is clicked', () => {
    const { getByRole } = render(<TestComponent />);
    const cancelButton = getByRole('link', { name: 'CANCEL' });

    expect(cancelButton).toHaveAttribute(
      'href',
      expect.stringContaining(
        `/accountLists/${accountListId}/reports/housingAllowance`,
      ),
    );
  });
});
