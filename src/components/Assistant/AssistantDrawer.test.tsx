import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { act, render, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import matchMediaMock from '__tests__/util/matchMediaMock';
import theme from 'src/theme';
import { AssistantDrawer } from './AssistantDrawer';
import { AssistantProvider, useAssistantContext } from './AssistantProvider';
import { CreateAssistantTokenMutation } from './CreateAssistantToken.generated';
import { mintedToken } from './assistantToken.mock';
import { DEFAULT_VISIBILITY } from './navigation/intents';
import { useNavigationVisibility } from './navigation/useNavigationVisibility';
import { frame, mockJsonResponse, mockStreamResponse } from './sse.mock';
import { useAssistantVisibility } from './useAssistantVisibility';

jest.mock('./useAssistantVisibility');
const mockUseAssistantVisibility = useAssistantVisibility as jest.MockedFn<
  typeof useAssistantVisibility
>;

jest.mock('./navigation/useNavigationVisibility');
const mockUseNavigationVisibility = useNavigationVisibility as jest.MockedFn<
  typeof useNavigationVisibility
>;

const mutationSpy = jest.fn();

const transcriptFrames = [
  frame({
    type: 'chunk',
    message_id: 'm1',
    delta: 'Your gifts are on the Dashboard. ',
  }),
  frame({
    type: 'card',
    message_id: 'm1',
    card: {
      kind: 'navigation',
      intent: { type: 'dashboard', params: {} },
      label: 'Open the Dashboard',
    },
  }),
  frame({
    type: 'card',
    message_id: 'm1',
    card: {
      kind: 'handoff',
      summary: 'The user cannot find their gifts.',
      contact_form: {
        name: 'First Last',
        email: 'first.last@cru.org',
        url: 'https://domain.helpjuice.com/contact-us',
      },
    },
  }),
  frame({
    type: 'generation_complete',
    message_id: 'm1',
    citations: [{ title: 'Finding gifts', url: 'https://help.test/gifts' }],
  }),
];

// Lets the mint that starts when the chat mounts land inside act before the test moves on
const waitForMint = async (count = 1) => {
  await waitFor(() => expect(mutationSpy).toHaveBeenCalledTimes(count));
  await act(() => new Promise((resolve) => setTimeout(resolve, 0)));
};

const OpenButton: React.FC = () => {
  const { openAssistant } = useAssistantContext();
  return <button onClick={openAssistant}>Open</button>;
};

const TestComponent: React.FC = () => (
  <ThemeProvider theme={theme}>
    <GqlMockedProvider<{ CreateAssistantToken: CreateAssistantTokenMutation }>
      mocks={{ CreateAssistantToken: mintedToken('minted-token') }}
      onCall={mutationSpy}
    >
      <TestRouter>
        <AssistantProvider>
          <OpenButton />
          <AssistantDrawer />
        </AssistantProvider>
      </TestRouter>
    </GqlMockedProvider>
  </ThemeProvider>
);

describe('AssistantDrawer', () => {
  beforeEach(() => {
    process.env.ASSISTANT_URL = 'https://assistant.test';
    mockUseAssistantVisibility.mockReturnValue(true);
    mockUseNavigationVisibility.mockReturnValue({
      visibility: DEFAULT_VISIBILITY,
      reportSegments: new Set(),
      isLoading: false,
    });
  });

  afterEach(() => {
    process.env.ASSISTANT_URL = '';
  });

  it('is closed by default', () => {
    const { queryByRole } = render(<TestComponent />);

    expect(queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('shows the header, placeholder, and input when open', async () => {
    const { getByRole, getByText } = render(<TestComponent />);

    userEvent.click(getByRole('button', { name: 'Open' }));

    expect(getByRole('dialog', { name: 'Assistant' })).toBeInTheDocument();
    expect(getByText('Ask a question to get started.')).toBeInTheDocument();
    expect(getByRole('textbox', { name: 'Ask the assistant' })).toBeEnabled();
    await waitForMint();
  });

  it('moves focus to the composer when opened', async () => {
    const { getByRole } = render(<TestComponent />);

    userEvent.click(getByRole('button', { name: 'Open' }));

    await waitFor(() =>
      expect(getByRole('textbox', { name: 'Ask the assistant' })).toHaveFocus(),
    );
    await waitForMint();
  });

  it('keeps the conversation when closed and reopened', async () => {
    const fetchSpy = jest
      .spyOn(global, 'fetch')
      .mockResolvedValueOnce(mockJsonResponse({ id: 'conversation-1' }))
      .mockResolvedValueOnce(
        mockStreamResponse([
          frame({ type: 'chunk', message_id: 'm1', delta: 'Hello back' }),
          frame({ type: 'generation_complete', message_id: 'm1' }),
        ]),
      );
    const { getByRole, findByText, queryByRole } = render(<TestComponent />);

    userEvent.click(getByRole('button', { name: 'Open' }));
    userEvent.type(
      getByRole('textbox', { name: 'Ask the assistant' }),
      'What is new?',
    );
    await waitFor(() =>
      expect(getByRole('button', { name: 'Send' })).toBeEnabled(),
    );
    userEvent.click(getByRole('button', { name: 'Send' }));
    expect(
      await findByText('Hello back', { selector: 'p' }),
    ).toBeInTheDocument();

    userEvent.click(getByRole('button', { name: 'Close Assistant' }));
    await waitFor(() => expect(queryByRole('dialog')).not.toBeInTheDocument());

    userEvent.click(getByRole('button', { name: 'Open' }));
    expect(
      await findByText('Hello back', { selector: 'p' }),
    ).toBeInTheDocument();
    expect(getByRole('dialog')).toHaveTextContent('What is new?');
    await waitForMint(2);
    fetchSpy.mockRestore();
  });

  it('closes when the close button is clicked', async () => {
    const { getByRole, queryByRole } = render(<TestComponent />);

    userEvent.click(getByRole('button', { name: 'Open' }));
    userEvent.click(getByRole('button', { name: 'Close Assistant' }));

    await waitFor(() => expect(queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('does not render when the assistant is hidden', () => {
    mockUseAssistantVisibility.mockReturnValue(false);

    const { getByRole, queryByRole } = render(<TestComponent />);

    userEvent.click(getByRole('button', { name: 'Open' }));

    expect(queryByRole('dialog')).not.toBeInTheDocument();
  });

  describe('with a transcript of text, cards, and a citation', () => {
    const writeText = jest.fn().mockResolvedValue(undefined);
    let fetchSpy: jest.SpyInstance;

    beforeEach(() => {
      Object.assign(navigator, { clipboard: { writeText } });
      fetchSpy = jest
        .spyOn(global, 'fetch')
        .mockResolvedValueOnce(mockJsonResponse({ id: 'conversation-1' }))
        .mockResolvedValueOnce(mockStreamResponse(transcriptFrames));
    });

    afterEach(() => {
      fetchSpy.mockRestore();
    });

    const renderTranscript = async () => {
      const utils = render(<TestComponent />);
      userEvent.click(utils.getByRole('button', { name: 'Open' }));
      userEvent.type(
        utils.getByRole('textbox', { name: 'Ask the assistant' }),
        'Where are my gifts?',
      );
      await waitFor(() =>
        expect(utils.getByRole('button', { name: 'Send' })).toBeEnabled(),
      );
      userEvent.click(utils.getByRole('button', { name: 'Send' }));
      expect(
        await utils.findByRole('link', { name: 'Finding gifts' }),
      ).toBeInTheDocument();
      expect(
        await utils.findByRole('link', { name: 'Open the Dashboard' }),
      ).toBeInTheDocument();
      await waitFor(() =>
        expect(
          utils.getByRole('textbox', { name: 'Ask the assistant' }),
        ).toHaveFocus(),
      );
      return utils;
    };

    it('exposes named landmarks, headings, lists, and controls', async () => {
      const { getByRole, getAllByRole } = await renderTranscript();
      const drawer = getByRole('dialog', { name: 'Assistant' });

      expect(drawer).toHaveAttribute('aria-modal', 'true');
      expect(
        getByRole('heading', { level: 2, name: 'Assistant' }),
      ).toBeInTheDocument();
      expect(
        getByRole('heading', { level: 3, name: 'Summary for the help desk' }),
      ).toBeInTheDocument();

      const log = getByRole('log', { name: 'Conversation' });
      const transcript = within(log).getAllByRole('list')[0];
      expect(within(transcript).getAllByRole('listitem')[0]).toHaveTextContent(
        'Where are my gifts?',
      );

      [...getAllByRole('button'), ...getAllByRole('link')].forEach((control) =>
        expect(control).toHaveAccessibleName(),
      );
      const ids = [...document.querySelectorAll('[id]')].map(
        (element) => element.id,
      );
      expect(new Set(ids).size).toBe(ids.length);
      await waitForMint();
    });

    it('reaches every card, citation, and hand-off control by keyboard with a visible focus state', async () => {
      const { getByRole } = await renderTranscript();
      const citation = getByRole('link', { name: 'Finding gifts' });
      const buttons = [
        getByRole('link', { name: 'Open the Dashboard' }),
        getByRole('link', { name: 'Contact the help desk' }),
        getByRole('button', { name: 'Copy summary' }),
      ];

      const reached = new Set<Element | null>();
      for (let press = 0; press < 10; press++) {
        userEvent.tab();
        reached.add(document.activeElement);
      }
      [...buttons, citation].forEach((target) =>
        expect(reached).toContain(target),
      );

      // jsdom cannot match :focus-visible, so check that nothing strips the default focus styles
      buttons.forEach((button) =>
        expect(
          button.querySelector('.MuiTouchRipple-root'),
        ).toBeInTheDocument(),
      );
      expect(getComputedStyle(citation).outlineStyle).not.toBe('none');
      expect(getComputedStyle(citation).outlineWidth).not.toBe('0');

      act(() => buttons[2].focus());
      userEvent.keyboard('{enter}');
      expect(writeText).toHaveBeenCalledWith(
        'The user cannot find their gifts.',
      );
      await waitForMint();
    });
  });

  describe('layout', () => {
    const openDrawer = async () => {
      const utils = render(<TestComponent />);
      userEvent.click(utils.getByRole('button', { name: 'Open' }));
      await waitForMint();
      return utils;
    };

    afterEach(() => {
      Object.defineProperty(window, 'visualViewport', {
        value: undefined,
        configurable: true,
      });
    });

    it('stays a 400px side panel on a wide screen', async () => {
      matchMediaMock({ width: '1024px' });
      const { getByRole } = await openDrawer();

      expect(getByRole('dialog')).toHaveStyle({ width: '400px' });
    });

    describe('at 375px', () => {
      beforeEach(() => {
        matchMediaMock({ width: '375px' });
      });

      it('fills the screen and scrolls long cards inside the message area', async () => {
        const { getByRole } = await openDrawer();
        const drawer = getByRole('dialog');

        await waitFor(() => expect(drawer).toHaveStyle({ width: '100vw' }));
        expect(getByRole('log').parentElement).toHaveStyle({
          overflowY: 'auto',
          minHeight: '0',
        });
      });

      it('follows the visible viewport so the composer stays above the on-screen keyboard', async () => {
        const viewport = Object.assign(new EventTarget(), {
          height: 700,
          offsetTop: 0,
        });
        Object.defineProperty(window, 'visualViewport', {
          value: viewport,
          configurable: true,
        });
        const { getByRole } = await openDrawer();
        const drawer = getByRole('dialog');
        await waitFor(() => expect(drawer.style.height).toBe('700px'));

        act(() => {
          Object.assign(viewport, { height: 360, offsetTop: 40 });
          viewport.dispatchEvent(new Event('resize'));
        });
        expect(drawer.style.height).toBe('360px');
        expect(drawer.style.top).toBe('40px');
      });
    });
  });
});
