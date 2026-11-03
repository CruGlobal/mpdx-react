import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DateTime } from 'luxon';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import matchMediaMock from '__tests__/util/matchMediaMock';
import { ContactPanelProvider } from 'src/components/Shared/ContactPanelProvider/ContactPanelProvider';
import theme from 'src/theme';
import { DonationsReportTable } from './DonationsReportTable';

const setTime = jest.fn();

// A past month, so Next Month is enabled
const december2019 = DateTime.local(2019, 12, 1);

interface TestComponentProps {
  time?: DateTime;
}

const TestComponent: React.FC<TestComponentProps> = ({
  time = DateTime.now(),
}) => (
  <TestRouter>
    <ThemeProvider theme={theme}>
      <GqlMockedProvider onCall={jest.fn()}>
        <ContactPanelProvider>
          <DonationsReportTable
            accountListId={'abc'}
            time={time}
            setTime={setTime}
          />
        </ContactPanelProvider>
      </GqlMockedProvider>
    </ThemeProvider>
  </TestRouter>
);

describe('DonationsReportTable', () => {
  it('updates the time filter', () => {
    const { getByRole } = render(<TestComponent />);

    userEvent.click(getByRole('button', { name: 'Previous Month' }));
    expect(setTime.mock.lastCall[0].toISODate()).toBe('2019-12-01');
  });

  describe('month buttons on desktop', () => {
    beforeEach(() => {
      matchMediaMock({ width: '1024px' });
    });

    it('shows text labels next to the chevrons', () => {
      const { getByRole } = render(<TestComponent time={december2019} />);

      const prevButton = getByRole('button', { name: 'Previous Month' });
      const nextButton = getByRole('button', { name: 'Next Month' });
      expect(prevButton).toHaveTextContent('Previous Month');
      expect(nextButton).toHaveTextContent('Next Month');
      expect(within(prevButton).getByTestId('ChevronLeftIcon')).toBeVisible();
      expect(within(nextButton).getByTestId('ChevronRightIcon')).toBeVisible();
    });
  });

  describe('month buttons on phones', () => {
    beforeEach(() => {
      matchMediaMock({ width: '390px' });
    });

    it('shows only the chevrons but keeps the button names', () => {
      const { getByRole, queryByText } = render(
        <TestComponent time={december2019} />,
      );

      expect(
        getByRole('heading', { name: 'December 2019' }),
      ).toBeInTheDocument();
      expect(queryByText('Previous Month')).not.toBeInTheDocument();
      expect(queryByText('Next Month')).not.toBeInTheDocument();

      const prevButton = getByRole('button', { name: 'Previous Month' });
      const nextButton = getByRole('button', { name: 'Next Month' });
      expect(within(prevButton).getByTestId('ChevronLeftIcon')).toBeVisible();
      expect(within(nextButton).getByTestId('ChevronRightIcon')).toBeVisible();
    });

    it('changes the month when the chevrons are clicked', () => {
      const { getByRole } = render(<TestComponent time={december2019} />);

      userEvent.click(getByRole('button', { name: 'Previous Month' }));
      expect(setTime.mock.lastCall[0].toISODate()).toBe('2019-11-01');

      userEvent.click(getByRole('button', { name: 'Next Month' }));
      expect(setTime.mock.lastCall[0].toISODate()).toBe('2020-01-01');
    });

    it('disables Next Month on the current month', () => {
      const { getByRole } = render(<TestComponent />);

      expect(getByRole('button', { name: 'Next Month' })).toBeDisabled();
    });
  });
});
