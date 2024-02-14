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
      '$23.45 (12%) / $58.01 (29%) / $70.35 (35%)',
    );
    expect(getByTestId('AppealProgressSegmentProcessed')).toHaveStyle(
      'width: 11.72%',
    );
    expect(getByTestId('AppealProgressSegmentReceived')).toHaveStyle(
      'width: 29.01%',
    );
    expect(getByTestId('AppealProgressSegmentCommitted')).toHaveStyle(
      'width: 35.18%',
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
