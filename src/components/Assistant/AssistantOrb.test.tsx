import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import matchMediaMock from '__tests__/util/matchMediaMock';
import { mockSession } from '__tests__/util/mockSession';
import { widgetHTML } from 'src/components/Helpjuice/widget.mock';
import theme from 'src/theme';
import { AssistantDrawer } from './AssistantDrawer';
import { AssistantLauncher } from './AssistantLauncher';
import { AssistantOrb } from './AssistantOrb';
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
  showOrb?: boolean;
}

const TestComponent: React.FC<TestComponentProps> = ({
  settings = {},
  showOrb = true,
}) => (
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
            {showOrb && <AssistantOrb />}
            <AssistantDrawer />
          </AssistantProvider>
        </GqlMockedProvider>
      </TestRouter>
    </SnackbarProvider>
  </ThemeProvider>
);

const orbName = { name: 'Open MPDX Guide' };

// The top bar button renders first, so the orb is the second button with the same name
const findOrb = async (
  findAllByRole: ReturnType<typeof render>['findAllByRole'],
) => (await findAllByRole('button', orbName))[1];

const settle = () => new Promise((resolve) => setTimeout(resolve, 50));

describe('AssistantOrb', () => {
  beforeEach(() => {
    process.env.DEVELOPMENT_ENV = 'true';
    process.env.DISABLE_ASSISTANT = 'false';
    mockSession({ developer: true, impersonating: false });
    matchMediaMock({ width: '1024px' });
  });

  afterEach(() => {
    process.env.DEVELOPMENT_ENV = 'false';
    document.querySelector('.hj-swifty')?.remove();
  });

  it('sits in the bottom right corner as a 56px circle', async () => {
    const { findAllByRole } = render(
      <TestComponent settings={{ enabled: true }} />,
    );

    expect(await findOrb(findAllByRole)).toHaveStyle({
      position: 'fixed',
      right: '24px',
      bottom: '24px',
      width: '56px',
      height: '56px',
      borderRadius: '50%',
    });
  });

  it('opens the same panel as the top bar button and returns focus to the orb', async () => {
    const { findAllByRole, getByRole, queryByRole } = render(
      <TestComponent settings={{ enabled: true }} />,
    );
    const orb = await findOrb(findAllByRole);

    userEvent.click(orb);
    expect(getByRole('dialog', { name: 'MPDX Guide' })).toBeInTheDocument();

    userEvent.keyboard('{esc}');
    await waitFor(() =>
      expect(
        queryByRole('dialog', { name: 'MPDX Guide' }),
      ).not.toBeInTheDocument(),
    );
    expect(orb).toHaveFocus();
  });

  it('opens the first-run explanation before opt-in', async () => {
    const { findAllByRole, findByRole } = render(<TestComponent />);

    userEvent.click(await findOrb(findAllByRole));

    expect(
      await findByRole('dialog', { name: 'Meet your MPDX Guide' }),
    ).toBeInTheDocument();
  });

  it.each([
    ['the user hid the Guide button', { launcherHidden: true }, () => {}],
    [
      'DISABLE_ASSISTANT is on',
      {},
      () => {
        process.env.DISABLE_ASSISTANT = 'true';
      },
    ],
    [
      'impersonating',
      {},
      () => mockSession({ developer: true, impersonating: true }),
    ],
    [
      'the rollout gate excludes the user',
      {},
      () => mockSession({ developer: false }),
    ],
  ])('is hidden when %s', async (_, settings, arrange) => {
    arrange();
    const { queryAllByRole } = render(
      <TestComponent settings={{ enabled: true, ...settings }} />,
    );

    await settle();
    expect(queryAllByRole('button', orbName)).toHaveLength(0);
  });

  it('moves the help beacon left while it shows and puts it back when it goes', async () => {
    document.body.insertAdjacentHTML('beforeend', widgetHTML);
    const beacon = document.getElementById('helpjuice-widget');
    const { findAllByRole, rerender } = render(
      <TestComponent settings={{ enabled: true }} />,
    );

    await findOrb(findAllByRole);
    await waitFor(() =>
      expect(beacon?.style.getPropertyValue('margin-right')).toBe('72px'),
    );
    expect(beacon?.style.getPropertyPriority('margin-right')).toBe('important');

    rerender(<TestComponent settings={{ enabled: true }} showOrb={false} />);
    expect(beacon?.style.getPropertyValue('margin-right')).toBe('');
  });

  it('keeps the beacon hidden while the panel is open', async () => {
    document.body.insertAdjacentHTML('beforeend', widgetHTML);
    const beacon = document.getElementById('helpjuice-widget');
    const { findAllByRole, getByRole, queryByRole } = render(
      <TestComponent settings={{ enabled: true }} />,
    );

    userEvent.click(await findOrb(findAllByRole));
    expect(beacon).not.toBeVisible();

    userEvent.click(getByRole('button', { name: 'Close MPDX Guide' }));
    await waitFor(() => expect(queryByRole('dialog')).not.toBeInTheDocument());
    expect(beacon).toBeVisible();
    expect(beacon?.style.getPropertyValue('margin-right')).toBe('72px');
  });
});
