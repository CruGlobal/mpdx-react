import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import theme from 'src/theme';
import {
  AdditionalSalaryRequestContext,
  AdditionalSalaryRequestType,
} from '../Shared/AdditionalSalaryRequestContext';
import { MissingLocationAlert } from './MissingLocationAlert';

const missingLocationText =
  "Your cap may be inaccurate because your location isn't set.";

const userDefault = {
  staffInfo: {
    city: 'New Braunfels',
    state: 'TX',
  },
};

type ComponentProps = {
  calculations?: object | null;
  user?: object;
};

const renderComponent = ({
  calculations = { currentSalaryCap: 75000, geographicLocation: null },
  user = userDefault,
}: ComponentProps = {}) =>
  render(
    <ThemeProvider theme={theme}>
      <SnackbarProvider>
        <GqlMockedProvider>
          <AdditionalSalaryRequestContext.Provider
            value={
              { calculations, user } as unknown as AdditionalSalaryRequestType
            }
          >
            <MissingLocationAlert />
          </AdditionalSalaryRequestContext.Provider>
        </GqlMockedProvider>
      </SnackbarProvider>
    </ThemeProvider>,
  );

describe('MissingLocationAlert', () => {
  it('shows the alert with the HCM city and state when the location is missing', () => {
    const { getByRole } = renderComponent();

    const alert = getByRole('alert');
    expect(alert).toHaveTextContent(missingLocationText);
    expect(alert).toHaveTextContent(
      'We see that you live in New Braunfels, TX. Please set your location so your cap is accurate.',
    );
    expect(getByRole('button', { name: 'Set Location' })).toBeInTheDocument();
  });

  it('leaves out where the user lives when HCM has no city or state', () => {
    const { getByRole } = renderComponent({
      user: { staffInfo: { city: null, state: null } },
    });

    const alert = getByRole('alert');
    expect(alert).toHaveTextContent(missingLocationText);
    expect(alert).not.toHaveTextContent('We see that you live in');
  });

  it('shows only the parts of the HCM location that exist', () => {
    const { getByRole } = renderComponent({
      user: { staffInfo: { city: null, state: 'TX' } },
    });

    expect(getByRole('alert')).toHaveTextContent('We see that you live in TX.');
  });

  it('opens the location modal from the Set Location button', () => {
    const { getByRole, queryByRole } = renderComponent();

    expect(queryByRole('dialog')).not.toBeInTheDocument();

    userEvent.click(getByRole('button', { name: 'Set Location' }));

    expect(
      getByRole('heading', { name: 'Set Your Location' }),
    ).toBeInTheDocument();
  });

  it('hides the alert when the location is set', () => {
    const { queryByRole } = renderComponent({
      calculations: {
        currentSalaryCap: 75000,
        geographicLocation: 'Orlando, FL',
      },
    });

    expect(queryByRole('alert')).not.toBeInTheDocument();
  });

  it('hides the alert when there are no calculations yet', () => {
    const { queryByRole } = renderComponent({
      calculations: null,
    });

    expect(queryByRole('alert')).not.toBeInTheDocument();
  });
});
