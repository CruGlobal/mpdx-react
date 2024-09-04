import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { useNextSetupPage } from 'src/components/Setup/useNextSetupPage';
import StartPage from './start.page';

jest.mock('src/components/Setup/useNextSetupPage');

const next = jest.fn();
(useNextSetupPage as jest.MockedFn<typeof useNextSetupPage>).mockReturnValue({
  next,
});

const push = jest.fn();
const router = {
  push,
};

describe('Setup start page', () => {
  it('autocomplete renders and button saves and advances to the next page', async () => {
    Object.defineProperty(window, 'navigator', {
      value: { ...window.navigator, language: 'fr-FR' },
    });

    const mutationSpy = jest.fn();
    const { getByRole } = render(
      <TestRouter router={router}>
        <GqlMockedProvider onCall={mutationSpy}>
          <StartPage />
        </GqlMockedProvider>
      </TestRouter>,
    );

    const autocomplete = getByRole('combobox');
    expect(autocomplete).toHaveValue('French (français)');
    userEvent.click(autocomplete);
    userEvent.click(getByRole('option', { name: 'German (Deutsch)' }));
    userEvent.click(getByRole('button', { name: "Let's Begin" }));
    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('UpdatePersonalPreferences', {
        input: { attributes: { locale: 'de' } },
      }),
    );
    expect(next).toHaveBeenCalled();
  });
});
