import { ThemeProvider } from '@emotion/react';
import { render } from '@testing-library/react';
import theme from 'src/theme';
import { AppealProgress } from './AppealProgress';

const appeal = {
  amount: 200,
  pledgesAmountNotReceivedNotProcessed: 12.34,
  pledgesAmountProcessed: 23.45,
  pledgesAmountReceivedNotProcessed: 34.56,
};

describe('AppealProgress', () => {
  it('renders the amounts, percentages, and progress bar', () => {
    const { getByTestId } = render(
      <ThemeProvider theme={theme}>
        <AppealProgress appeal={appeal} />
      </ThemeProvider>,
    );

    expect(getByTestId('AppealProgressAmounts')).toHaveTextContent(
      '$23.45 (12%) / $34.56 (17%) / $12.34 (6%)',
    );
    expect(getByTestId('AppealProgressSegmentProcessed')).toHaveStyle(
      'width: 11.72%',
    );
    expect(getByTestId('AppealProgressSegmentReceived')).toHaveStyle(
      'width: 17.28%',
    );
    expect(getByTestId('AppealProgressSegmentCommitted')).toHaveStyle(
      'width: 6.17%',
    );
  });

  it('renders zeros without an appeal', () => {
    const { getByTestId } = render(
      <ThemeProvider theme={theme}>
        <AppealProgress />
      </ThemeProvider>,
    );

    expect(getByTestId('AppealProgressAmounts')).toHaveTextContent(
      '$0 (0%) / $0 (0%) / $0 (0%)',
    );
    expect(getByTestId('AppealProgressSegmentProcessed')).toHaveStyle(
      'width: 0.00%',
    );
    expect(getByTestId('AppealProgressSegmentReceived')).toHaveStyle(
      'width: 0.00%',
    );
    expect(getByTestId('AppealProgressSegmentCommitted')).toHaveStyle(
      'width: 0.00%',
    );
  });
});
