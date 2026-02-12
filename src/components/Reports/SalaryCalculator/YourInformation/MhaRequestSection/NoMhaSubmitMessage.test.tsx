import { ThemeProvider } from '@emotion/react';
import { render } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import TestRouter from '__tests__/util/TestRouter';
import i18n from 'src/lib/i18n';
import theme from 'src/theme';
import { NoMhaSubmitMessage } from './NoMhaSubmitMessage';

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider theme={theme}>
    <I18nextProvider i18n={i18n}>
      <TestRouter>{children}</TestRouter>
    </I18nextProvider>
  </ThemeProvider>
);

describe('NoMhaSubmitMessage', () => {
  it('should render singular message when isPlural is false', () => {
    const { getByText } = render(
      <TestWrapper>
        <NoMhaSubmitMessage
          isPlural={false}
          names="John"
          showNoMhaMessage={true}
        />
      </TestWrapper>,
    );

    expect(
      getByText(/does not have a Minister's Housing Allowance/),
    ).toBeInTheDocument();
    expect(
      getByText(/has not yet submitted an MHA Request form/),
    ).toBeInTheDocument();
    expect(
      getByText(/has a pending MHA Request, it will not apply/),
    ).toBeInTheDocument();
  });

  it('should render plural message when isPlural is true', () => {
    const { getByText } = render(
      <TestWrapper>
        <NoMhaSubmitMessage
          isPlural={true}
          names="John and Jane"
          showNoMhaMessage={true}
        />
      </TestWrapper>,
    );

    expect(
      getByText(/do not have a Minister's Housing Allowance/),
    ).toBeInTheDocument();
    expect(
      getByText(/have not yet submitted an MHA Request form/),
    ).toBeInTheDocument();
    expect(
      getByText(/have a pending MHA Request, it will not apply/),
    ).toBeInTheDocument();
  });

  it('should render link to housing allowance page', () => {
    const { getByRole } = render(
      <TestWrapper>
        <NoMhaSubmitMessage
          isPlural={false}
          names="John"
          showNoMhaMessage={true}
        />
      </TestWrapper>,
    );

    const link = getByRole('link', { name: 'this link.' });
    expect(link).toHaveAttribute(
      'href',
      `/accountLists/account-list-1/reports/housingAllowance`,
    );
  });

  it('should render singular ineligible message when one person has not completed IBS courses', () => {
    const { getByTestId, getByText } = render(
      <TestWrapper>
        <NoMhaSubmitMessage
          isPlural={false}
          names="John"
          showIneligibleMessage={true}
          isIneligiblePlural={false}
          ineligibleNames="John"
        />
      </TestWrapper>,
    );

    expect(getByTestId('ineligible-message')).toBeInTheDocument();
    expect(
      getByText(/has not completed the required IBS courses/),
    ).toBeInTheDocument();
  });

  it('should render plural ineligible message when both have not completed IBS courses', () => {
    const { getByTestId, getByText } = render(
      <TestWrapper>
        <NoMhaSubmitMessage
          isPlural={true}
          names="John and Jane"
          showIneligibleMessage={true}
          isIneligiblePlural={true}
          ineligibleNames="John and Jane"
        />
      </TestWrapper>,
    );

    expect(getByTestId('ineligible-message')).toBeInTheDocument();
    expect(
      getByText(/have not completed the required IBS courses/),
    ).toBeInTheDocument();
  });

  it('should not render ineligible message when showIneligibleMessage is false', () => {
    const { queryByTestId } = render(
      <TestWrapper>
        <NoMhaSubmitMessage
          isPlural={false}
          names="John"
          showIneligibleMessage={false}
        />
      </TestWrapper>,
    );

    expect(queryByTestId('ineligible-message')).not.toBeInTheDocument();
  });

  it('should not render ineligible message when ineligibleNames is empty', () => {
    const { queryByTestId } = render(
      <TestWrapper>
        <NoMhaSubmitMessage
          isPlural={false}
          names="John"
          showIneligibleMessage={true}
          ineligibleNames=""
        />
      </TestWrapper>,
    );

    expect(queryByTestId('ineligible-message')).not.toBeInTheDocument();
  });
});
