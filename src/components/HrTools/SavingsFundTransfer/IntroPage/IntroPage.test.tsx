import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import TestRouter from '__tests__/util/TestRouter';
import { getStyleAtWidth } from '__tests__/util/styleAtWidth';
import theme from 'src/theme';
import { StaffSavingFundProvider } from '../../StaffSavingFund/StaffSavingFundContext';
import IntroPage from './IntroPage';

const router = { query: { accountListId: 'account-list-1' } };

describe('IntroPage', () => {
  it('sends questions to HR Services with its phone numbers and email, not Staff Services', () => {
    const { getByText, queryByText } = render(
      <TestRouter router={router}>
        <StaffSavingFundProvider>
          <IntroPage title="Savings Fund Transfer" />
        </StaffSavingFundProvider>
      </TestRouter>,
    );

    const contactLine = getByText(/please email HR Services at/);
    expect(contactLine).toHaveTextContent(
      'please email HR Services at HR@cru.org, or call (888) 278-7233 or (407) 826-2287.',
    );
    expect(getByText('HR@cru.org')).toHaveAttribute(
      'href',
      'mailto:HR@cru.org',
    );
    expect(queryByText(/Staff Services/)).not.toBeInTheDocument();
  });

  it('leaves room at the end so the last paragraph can scroll clear of the help button', () => {
    const { container, getByText } = render(
      <ThemeProvider theme={theme}>
        <TestRouter router={router}>
          <StaffSavingFundProvider>
            <IntroPage title="Savings Fund Transfer" />
          </StaffSavingFundProvider>
        </TestRouter>
      </ThemeProvider>,
    );

    const page = container.firstElementChild;
    if (!page) {
      throw new Error('The intro page rendered nothing');
    }
    expect(page).toContainElement(getByText(/please email HR Services at/));
    // The help button covers about 76px at the bottom of phones and 176px from 600px up
    const getEndRoom = (width: number) =>
      parseFloat(getStyleAtWidth(page, 'padding-bottom', width)) || 0;
    expect(getEndRoom(360)).toBeGreaterThanOrEqual(76);
    expect(getEndRoom(390)).toBeGreaterThanOrEqual(76);
    expect(getEndRoom(768)).toBeGreaterThanOrEqual(176);
    expect(getEndRoom(1280)).toBeGreaterThanOrEqual(176);
  });
});
