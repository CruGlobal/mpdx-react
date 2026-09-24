import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { act, render, waitFor, within } from '@testing-library/react';
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
import { useGuideOrbClearance } from './guideOrbClearance';

const mutationSpy = jest.fn();

interface TestComponentProps {
  settings?: Partial<AssistantSettingsFieldsFragment>;
  showOrb?: boolean;
  mapPage?: boolean;
}

const MapPage: React.FC = () => {
  useGuideOrbClearance(72);
  return null;
};

const TestComponent: React.FC<TestComponentProps> = ({
  settings = {},
  showOrb = true,
  mapPage = false,
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
            {mapPage && <MapPage />}
            <AssistantDrawer />
          </AssistantProvider>
        </GqlMockedProvider>
      </TestRouter>
    </SnackbarProvider>
  </ThemeProvider>
);

const orbName = { name: 'Open MPDX Guide' };
const nudgeText = 'Need a hand with MPDX?';

const circleOf = (orb: HTMLElement) =>
  orb.querySelector('[data-guide-orb]') as HTMLElement;

// The top bar button renders first, so the orb is the second button with the same name
const findOrb = async (
  findAllByRole: ReturnType<typeof render>['findAllByRole'],
) => (await findAllByRole('button', orbName))[1];

const settle = () => new Promise<void>((resolve) => setTimeout(resolve, 50));

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
    localStorage.clear();
    sessionStorage.clear();
  });

  it('sits in the bottom right corner as a 56px circle', async () => {
    const { findAllByRole } = render(
      <TestComponent settings={{ enabled: true }} />,
    );

    const orb = await findOrb(findAllByRole);
    expect(orb.parentElement).toHaveStyle({
      position: 'fixed',
      right: '24px',
      bottom: '24px',
    });
    expect(circleOf(orb)).toHaveStyle({
      width: '56px',
      height: '56px',
      borderRadius: '50%',
    });
    expect(circleOf(orb)).not.toHaveAttribute('sx');
    expect(getComputedStyle(circleOf(orb)).boxShadow).toMatch(
      /rgba\(0, 0, 0, 0\.25\)/,
    );
  });

  it('moves left of the map zoom controls on a page that asks for room', async () => {
    const { findAllByRole, rerender } = render(
      <TestComponent settings={{ enabled: true }} mapPage />,
    );
    const orb = await findOrb(findAllByRole);

    expect(orb.parentElement).toHaveStyle({ right: '72px', bottom: '24px' });

    rerender(<TestComponent settings={{ enabled: true }} />);
    expect(orb.parentElement).toHaveStyle({ right: '24px' });
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

  it('keeps the orbs still while closed and breathes gently only while open', async () => {
    const { findAllByRole, getByRole, queryByRole } = render(
      <TestComponent settings={{ enabled: true }} />,
    );
    const orb = await findOrb(findAllByRole);
    expect(circleOf(orb)).not.toHaveAttribute('data-animating');
    expect(getComputedStyle(circleOf(orb)).animationName).toBe('');

    userEvent.click(orb);
    const dialog = getByRole('dialog', { name: 'MPDX Guide' });
    expect(circleOf(orb)).toHaveAttribute('data-animating', 'true');
    expect(dialog.querySelector('[data-animating="true"]')).toBeInTheDocument();
    // The motion lives only behind the reduced motion guard
    const css = [...document.querySelectorAll('style')]
      .map((style) => style.textContent)
      .join('');
    expect(css).toMatch(
      /@media \(prefers-reduced-motion: no-preference\)\{[^{}]*\[data-animating="true"\]\{[^}]*animation:[^;]* 3s /,
    );

    userEvent.keyboard('{esc}');
    await waitFor(() =>
      expect(
        queryByRole('dialog', { name: 'MPDX Guide' }),
      ).not.toBeInTheDocument(),
    );
    expect(circleOf(orb)).not.toHaveAttribute('data-animating');
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
    const { queryAllByRole, queryAllByText } = render(
      <TestComponent settings={{ enabled: true, ...settings }} />,
    );

    await settle();
    expect(queryAllByRole('button', orbName)).toHaveLength(0);
    expect(queryAllByText(nudgeText)).toHaveLength(0);
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

  describe('label', () => {
    it('names the orb with a pill that hides while the Guide is open', async () => {
      localStorage.setItem('mpdx-guide-opened', 'true');
      const { findAllByRole, queryByRole } = render(
        <TestComponent settings={{ enabled: true }} />,
      );
      const orb = await findOrb(findAllByRole);

      expect(orb).toHaveTextContent('MPDX Guide');
      expect(
        within(orb.parentElement as HTMLElement).getAllByRole('button'),
      ).toHaveLength(1);

      userEvent.click(orb);
      expect(orb).not.toHaveTextContent('MPDX Guide');

      userEvent.keyboard('{esc}');
      await waitFor(() =>
        expect(queryByRole('dialog')).not.toBeInTheDocument(),
      );
      expect(orb).toHaveTextContent('MPDX Guide');
    });

    it('lets the nudge take its place and then hands it back', async () => {
      const { findAllByRole, findByText, getByRole } = render(
        <TestComponent settings={{ enabled: true }} />,
      );
      const orb = await findOrb(findAllByRole);

      expect(await findByText(nudgeText)).toBeInTheDocument();
      expect(orb).toHaveTextContent(nudgeText);
      expect(orb).not.toHaveTextContent(/^MPDX Guide$/);
      expect(orb).toHaveAccessibleDescription(nudgeText);

      userEvent.click(getByRole('button', { name: 'Dismiss' }));
      expect(orb).toHaveTextContent('MPDX Guide');
      expect(orb).not.toHaveTextContent(nudgeText);
    });

    it('uses the app name for other organizations', async () => {
      const appName = process.env.APP_NAME;
      process.env.APP_NAME = 'TntConnect';
      localStorage.setItem('mpdx-guide-opened', 'true');
      try {
        const { findAllByRole } = render(
          <TestComponent settings={{ enabled: true }} />,
        );
        const [, orb] = await findAllByRole('button', {
          name: 'Open TntConnect Guide',
        });
        expect(orb).toHaveTextContent('TntConnect Guide');
      } finally {
        process.env.APP_NAME = appName;
      }
    });
  });

  describe('nudge', () => {
    it('offers help beside the orb and opens the Guide when clicked', async () => {
      const { findByText, getByRole, queryByText } = render(
        <TestComponent settings={{ enabled: true }} />,
      );

      userEvent.click(await findByText(nudgeText));

      expect(getByRole('dialog', { name: 'MPDX Guide' })).toBeInTheDocument();
      expect(queryByText(nudgeText)).not.toBeInTheDocument();
    });

    it('opens the first-run explanation before opt-in', async () => {
      const { findByRole, findByText } = render(<TestComponent />);

      userEvent.click(await findByText(nudgeText));

      expect(
        await findByRole('dialog', { name: 'Meet your MPDX Guide' }),
      ).toBeInTheDocument();
    });

    it('returns focus to the orb when the first-run explanation it opened is closed', async () => {
      const { findAllByRole, findByText, findByRole, queryByRole } = render(
        <TestComponent />,
      );
      const orb = await findOrb(findAllByRole);

      userEvent.click(await findByText(nudgeText));
      const dialog = await findByRole('dialog', {
        name: 'Meet your MPDX Guide',
      });
      userEvent.keyboard('{esc}');
      await waitFor(() => expect(dialog).not.toBeInTheDocument());

      await waitFor(() => expect(orb).toHaveFocus());
      expect(queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('goes away when dismissed', async () => {
      const { findByRole, queryByText, getAllByRole } = render(
        <TestComponent settings={{ enabled: true }} />,
      );

      userEvent.click(await findByRole('button', { name: 'Dismiss' }));

      expect(queryByText(nudgeText)).not.toBeInTheDocument();
      expect(getAllByRole('button', orbName)).toHaveLength(2);
    });

    it('shows only once per browser session', async () => {
      const first = render(<TestComponent settings={{ enabled: true }} />);
      expect(await first.findByText(nudgeText)).toBeInTheDocument();
      first.unmount();

      const { findAllByRole, queryByText } = render(
        <TestComponent settings={{ enabled: true }} />,
      );
      await findOrb(findAllByRole);
      expect(queryByText(nudgeText)).not.toBeInTheDocument();
    });

    it('never shows again once the Guide has been opened', async () => {
      const first = render(<TestComponent settings={{ enabled: true }} />);
      userEvent.click(await findOrb(first.findAllByRole));
      first.unmount();
      sessionStorage.clear();

      const { findAllByRole, queryByText } = render(
        <TestComponent settings={{ enabled: true }} />,
      );
      await findOrb(findAllByRole);
      expect(queryByText(nudgeText)).not.toBeInTheDocument();
    });

    it('still works when browser storage is blocked', async () => {
      const getItem = jest
        .spyOn(Storage.prototype, 'getItem')
        .mockImplementation(() => {
          throw new Error('blocked');
        });
      const setItem = jest
        .spyOn(Storage.prototype, 'setItem')
        .mockImplementation(() => {
          throw new Error('blocked');
        });
      try {
        const { findByText, getAllByRole, queryByRole, queryByText } = render(
          <TestComponent settings={{ enabled: true }} />,
        );

        expect(await findByText(nudgeText)).toBeInTheDocument();
        userEvent.click(getAllByRole('button', orbName)[1]);
        userEvent.keyboard('{esc}');
        await waitFor(() =>
          expect(queryByRole('dialog')).not.toBeInTheDocument(),
        );
        expect(queryByText(nudgeText)).not.toBeInTheDocument();
      } finally {
        getItem.mockRestore();
        setItem.mockRestore();
      }
    });

    it('is left out on phones', async () => {
      matchMediaMock({ width: '375px' });
      const { findAllByRole, queryByText } = render(
        <TestComponent settings={{ enabled: true }} />,
      );

      await findOrb(findAllByRole);
      await act(settle);
      expect(queryByText(nudgeText)).not.toBeInTheDocument();
    });
  });
});
