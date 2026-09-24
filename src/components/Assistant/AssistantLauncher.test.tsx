import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import matchMediaMock from '__tests__/util/matchMediaMock';
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

const launcherName = { name: 'Open MPDX Guide' };

const activeElement = () => document.activeElement as HTMLElement;

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

    expect(getByRole('dialog', { name: 'MPDX Guide' })).toBeInTheDocument();
  });

  it('opens the first-run explanation instead of the drawer before opt-in', async () => {
    const { findByRole, queryByRole } = render(<TestComponent />);

    userEvent.click(await findByRole('button', launcherName));

    expect(
      await findByRole('dialog', { name: 'Meet your MPDX Guide' }),
    ).toBeInTheDocument();
    expect(
      queryByRole('dialog', { name: 'MPDX Guide' }),
    ).not.toBeInTheDocument();
  });

  it('opens the drawer after the user turns it on', async () => {
    const { findByRole } = render(<TestComponent />);

    userEvent.click(await findByRole('button', launcherName));
    userEvent.click(await findByRole('button', { name: 'Turn it on' }));

    expect(
      await findByRole('dialog', { name: 'MPDX Guide' }),
    ).toBeInTheDocument();
  });

  it('moves focus into the drawer and back to the launcher when Escape closes it', async () => {
    const { findByRole, getByRole, queryByRole } = render(
      <TestComponent settings={{ enabled: true }} />,
    );
    const launcher = await findByRole('button', launcherName);

    userEvent.click(launcher);
    const drawer = getByRole('dialog', { name: 'MPDX Guide' });
    await waitFor(() => expect(drawer).toContainElement(activeElement()));

    userEvent.keyboard('{esc}');
    await waitFor(() =>
      expect(
        queryByRole('dialog', { name: 'MPDX Guide' }),
      ).not.toBeInTheDocument(),
    );
    expect(launcher).toHaveFocus();
  });

  it('keeps Tab focus inside the full-screen drawer on a phone', async () => {
    matchMediaMock({ width: '375px' });
    const { findByRole, getByRole } = render(
      <TestComponent settings={{ enabled: true }} />,
    );

    userEvent.click(await findByRole('button', launcherName));
    const drawer = getByRole('dialog', { name: 'MPDX Guide' });
    for (let press = 0; press < 4; press++) {
      userEvent.tab();
      await waitFor(() => expect(drawer).toContainElement(activeElement()));
    }
    for (let press = 0; press < 4; press++) {
      userEvent.tab({ shift: true });
      await waitFor(() => expect(drawer).toContainElement(activeElement()));
    }
  });

  it('returns focus to the launcher after the first-run dialog opens the drawer', async () => {
    const { findByRole, getByRole, queryByRole } = render(<TestComponent />);
    const launcher = await findByRole('button', launcherName);

    userEvent.click(launcher);
    userEvent.click(await findByRole('button', { name: 'Turn it on' }));
    const card = await findByRole('dialog', { name: 'MPDX Guide' });
    await waitFor(() =>
      expect(
        queryByRole('dialog', { name: 'Meet your MPDX Guide' }),
      ).not.toBeInTheDocument(),
    );
    await waitFor(() => expect(card).toContainElement(activeElement()));

    userEvent.click(getByRole('button', { name: 'Close MPDX Guide' }));
    await waitFor(() =>
      expect(
        queryByRole('dialog', { name: 'MPDX Guide' }),
      ).not.toBeInTheDocument(),
    );
    expect(launcher).toHaveFocus();
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
