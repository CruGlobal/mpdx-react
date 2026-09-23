import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { mockSession } from '__tests__/util/mockSession';
import theme from 'src/theme';
import { AssistantDrawer } from './AssistantDrawer';
import { AssistantLauncher } from './AssistantLauncher';
import { AssistantProvider } from './AssistantProvider';
import {
  AssistantSettingsFieldsFragment,
  AssistantSettingsQuery,
  UpdateAssistantSettingsMutation,
} from './AssistantSettings.generated';
import { assistantSettingsMock } from './AssistantSettings.mock';

const mutationSpy = jest.fn();

interface TestComponentProps {
  settings?: Partial<AssistantSettingsFieldsFragment>;
}

const TestComponent: React.FC<TestComponentProps> = ({ settings = {} }) => (
  <ThemeProvider theme={theme}>
    <SnackbarProvider>
      <TestRouter>
        <GqlMockedProvider<{
          AssistantSettings: AssistantSettingsQuery;
          UpdateAssistantSettings: UpdateAssistantSettingsMutation;
        }>
          mocks={{
            AssistantSettings: {
              assistantSettings: assistantSettingsMock(settings),
            },
            UpdateAssistantSettings: {
              updateAssistantSettings: {
                assistantSettings: assistantSettingsMock({
                  ...settings,
                  enabled: true,
                  helpEnabled: true,
                }),
              },
            },
          }}
          onCall={mutationSpy}
        >
          <AssistantProvider>
            <AssistantLauncher />
            <AssistantDrawer />
          </AssistantProvider>
        </GqlMockedProvider>
      </TestRouter>
    </SnackbarProvider>
  </ThemeProvider>
);

const launcherName = { name: 'Open Assistant' };

// Lets the settings query resolve before asserting that nothing rendered
const settle = () => new Promise((resolve) => setTimeout(resolve, 50));

describe('AssistantLauncher', () => {
  beforeEach(() => {
    process.env.DEVELOPMENT_ENV = 'true';
    process.env.DISABLE_ASSISTANT = 'false';
    mockSession({ developer: true, impersonating: false });
  });

  afterEach(() => {
    process.env.DEVELOPMENT_ENV = 'false';
    process.env.DISABLE_ASSISTANT = 'false';
  });

  it('opens the drawer when the user has opted in', async () => {
    const { findByRole, getByRole } = render(
      <TestComponent settings={{ enabled: true }} />,
    );

    userEvent.click(await findByRole('button', launcherName));

    expect(getByRole('dialog', { name: 'Assistant' })).toBeInTheDocument();
  });

  it('opens the first-run explanation instead of the drawer before opt-in', async () => {
    const { findByRole, queryByRole } = render(<TestComponent />);

    userEvent.click(await findByRole('button', launcherName));

    expect(
      await findByRole('dialog', { name: 'Meet the Assistant' }),
    ).toBeInTheDocument();
    expect(
      queryByRole('dialog', { name: 'Assistant' }),
    ).not.toBeInTheDocument();
  });

  it('opens the drawer after the user turns it on', async () => {
    const { findByRole } = render(<TestComponent />);

    userEvent.click(await findByRole('button', launcherName));
    userEvent.click(await findByRole('button', { name: 'Turn it on' }));

    expect(
      await findByRole('dialog', { name: 'Assistant' }),
    ).toBeInTheDocument();
  });

  it('is hidden when the user hid the launcher', async () => {
    const { queryByRole } = render(
      <TestComponent settings={{ enabled: true, launcherHidden: true }} />,
    );

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('AssistantSettings'),
    );
    await settle();
    expect(queryByRole('button', launcherName)).not.toBeInTheDocument();
  });

  it('is hidden when DISABLE_ASSISTANT is on', async () => {
    process.env.DISABLE_ASSISTANT = 'true';

    const { queryByRole } = render(
      <TestComponent settings={{ enabled: true }} />,
    );

    await settle();
    expect(queryByRole('button', launcherName)).not.toBeInTheDocument();
  });

  it('is hidden when impersonating', async () => {
    mockSession({ developer: true, impersonating: true });

    const { queryByRole } = render(
      <TestComponent settings={{ enabled: true }} />,
    );

    await settle();
    expect(queryByRole('button', launcherName)).not.toBeInTheDocument();
  });

  it('is hidden from non-developers while the rollout gate is on', async () => {
    mockSession({ developer: false });

    const { queryByRole } = render(<TestComponent />);

    await settle();
    expect(queryByRole('button', launcherName)).not.toBeInTheDocument();
  });
});
