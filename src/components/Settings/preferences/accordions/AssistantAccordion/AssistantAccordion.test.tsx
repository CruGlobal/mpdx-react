import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { AssistantSettingsFieldsFragment } from 'src/components/Assistant/AssistantSettings.generated';
import { assistantSettingsMock } from 'src/components/Assistant/AssistantSettings.mock';
import { mockJsonResponse } from 'src/components/Assistant/sse.mock';
import { PreferenceAccordion } from 'src/components/Shared/Forms/Accordions/AccordionEnum';
import theme from 'src/theme';
import { AssistantAccordion } from './AssistantAccordion';

jest.mock('src/components/Assistant/useAssistantToken', () => ({
  useAssistantToken: () => 'assistant-token',
}));

const mockEnqueue = jest.fn();
jest.mock('notistack', () => ({
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  ...jest.requireActual('notistack'),
  useSnackbar: () => {
    return {
      enqueueSnackbar: mockEnqueue,
    };
  },
}));

const mutationSpy = jest.fn();
const handleAccordionChange = jest.fn();

const optedIn = { enabled: true, helpEnabled: true };

interface TestComponentProps {
  settings?: Partial<AssistantSettingsFieldsFragment>;
  expandedAccordion?: PreferenceAccordion | null;
}

const TestComponent: React.FC<TestComponentProps> = ({
  settings = optedIn,
  expandedAccordion = PreferenceAccordion.Assistant,
}) => (
  <ThemeProvider theme={theme}>
    <SnackbarProvider>
      <TestRouter>
        <GqlMockedProvider onCall={mutationSpy}>
          <AssistantAccordion
            handleAccordionChange={handleAccordionChange}
            expandedAccordion={expandedAccordion}
            settings={assistantSettingsMock(settings)}
          />
        </GqlMockedProvider>
      </TestRouter>
    </SnackbarProvider>
  </ThemeProvider>
);

const shippedCapabilities = [
  ['Help me use MPDX', 'helpEnabled'],
  ['Keep my conversation history', 'historyEnabled'],
] as const;

const comingLaterCapabilities = [
  'Summarize my account',
  'Talk about my partners',
  'Show partner details on request',
  'Suggest next steps',
  'Help write my prayer letters',
];

describe('AssistantAccordion', () => {
  let fetchSpy: jest.SpyInstance;

  beforeEach(() => {
    process.env.ASSISTANT_URL = 'https://assistant.test';
    fetchSpy = jest.spyOn(global, 'fetch');
  });

  afterEach(() => {
    process.env.ASSISTANT_URL = '';
    fetchSpy.mockRestore();
  });

  it('shows whether the assistant is on when closed', () => {
    const { getByText, queryByLabelText } = render(
      <TestComponent expandedAccordion={null} />,
    );

    expect(getByText('Assistant')).toBeInTheDocument();
    expect(getByText('On')).toBeInTheDocument();
    expect(queryByLabelText('Turn on the Assistant')).not.toBeInTheDocument();
  });

  it('renders every switch with its initial state after opt-in', () => {
    const { getByLabelText, getAllByText } = render(<TestComponent />);

    expect(getByLabelText('Turn on the Assistant')).toBeChecked();
    expect(getByLabelText('Hide the Assistant button')).not.toBeChecked();
    expect(getByLabelText('Hide the Assistant button')).toBeEnabled();

    expect(getByLabelText('Help me use MPDX')).toBeChecked();
    expect(getByLabelText('Help me use MPDX')).toBeEnabled();
    expect(getByLabelText('Keep my conversation history')).not.toBeChecked();
    expect(getByLabelText('Keep my conversation history')).toBeEnabled();

    comingLaterCapabilities.forEach((label) => {
      expect(getByLabelText(label)).not.toBeChecked();
      expect(getByLabelText(label)).toBeDisabled();
    });
    expect(getAllByText('Coming later.')).toHaveLength(5);
    expect(getAllByText(/^What the model sees:/)).toHaveLength(7);
  });

  it('describes what the model sees for each switch', () => {
    const { getByLabelText } = render(<TestComponent />);

    expect(getByLabelText('Help me use MPDX')).toHaveAccessibleDescription(
      'What the model sees: help articles and a map of the app. No account data.',
    );
  });

  it('disables the capability switches until the assistant is on', () => {
    const { getByLabelText } = render(<TestComponent settings={{}} />);

    expect(getByLabelText('Turn on the Assistant')).not.toBeChecked();
    expect(getByLabelText('Hide the Assistant button')).toBeEnabled();
    expect(getByLabelText('Help me use MPDX')).toBeDisabled();
    expect(getByLabelText('Keep my conversation history')).toBeDisabled();
  });

  it.each(shippedCapabilities)('saves %s', async (label, field) => {
    const { getByLabelText } = render(
      <TestComponent settings={{ ...optedIn, historyEnabled: false }} />,
    );
    const checked = !(getByLabelText(label) as HTMLInputElement).checked;

    userEvent.click(getByLabelText(label));

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('UpdateAssistantSettings', {
        attributes: { [field]: checked },
      }),
    );
    await waitFor(() =>
      expect(mockEnqueue).toHaveBeenCalledWith('Saved successfully.', {
        variant: 'success',
      }),
    );
  });

  it('saves the hidden launcher switch, even before opt-in', async () => {
    const { getByLabelText } = render(
      <TestComponent settings={{ launcherHidden: true }} />,
    );

    expect(getByLabelText('Hide the Assistant button')).toBeChecked();
    userEvent.click(getByLabelText('Hide the Assistant button'));

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('UpdateAssistantSettings', {
        attributes: { launcherHidden: false },
      }),
    );
  });

  it('shows the first-run explanation before turning the assistant on', async () => {
    const { getByLabelText, findByRole } = render(
      <TestComponent settings={{}} />,
    );

    userEvent.click(getByLabelText('Turn on the Assistant'));
    const dialog = await findByRole('dialog', { name: 'Meet the Assistant' });
    userEvent.click(within(dialog).getByRole('button', { name: 'Turn it on' }));

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('UpdateAssistantSettings', {
        attributes: { enabled: true },
      }),
    );
  });

  describe('opting out', () => {
    it('deletes conversations, shows the counts, then turns the assistant off', async () => {
      fetchSpy.mockResolvedValueOnce(
        mockJsonResponse({ deleted_conversations: 3, deleted_messages: 42 }),
      );
      const { getByLabelText, findByRole, findByText } = render(
        <TestComponent />,
      );

      userEvent.click(getByLabelText('Turn on the Assistant'));
      const dialog = await findByRole('dialog', {
        name: 'Turn off the Assistant?',
      });
      expect(mutationSpy).not.toHaveGraphqlOperation('UpdateAssistantSettings');
      userEvent.click(
        within(dialog).getByRole('button', { name: 'Turn off and delete' }),
      );

      expect(await findByText('Conversations deleted: 3')).toBeInTheDocument();
      expect(await findByText('Messages deleted: 42')).toBeInTheDocument();
      expect(fetchSpy).toHaveBeenCalledWith(
        'https://assistant.test/conversations',
        {
          method: 'DELETE',
          headers: { Authorization: 'Bearer assistant-token' },
        },
      );
      await waitFor(() =>
        expect(mutationSpy).toHaveGraphqlOperation('UpdateAssistantSettings', {
          attributes: { enabled: false },
        }),
      );
    });

    it('does nothing when cancelled', async () => {
      const { getByLabelText, findByRole, queryByRole } = render(
        <TestComponent />,
      );

      userEvent.click(getByLabelText('Turn on the Assistant'));
      const dialog = await findByRole('dialog', {
        name: 'Turn off the Assistant?',
      });
      userEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }));

      await waitFor(() =>
        expect(
          queryByRole('dialog', { name: 'Turn off the Assistant?' }),
        ).not.toBeInTheDocument(),
      );
      expect(fetchSpy).not.toHaveBeenCalled();
      expect(mutationSpy).not.toHaveGraphqlOperation('UpdateAssistantSettings');
    });

    it('leaves the assistant on when deletion fails', async () => {
      fetchSpy.mockResolvedValueOnce(
        mockJsonResponse({}, { ok: false, status: 500 }),
      );
      const { getByLabelText, findByRole } = render(<TestComponent />);

      userEvent.click(getByLabelText('Turn on the Assistant'));
      const dialog = await findByRole('dialog', {
        name: 'Turn off the Assistant?',
      });
      userEvent.click(
        within(dialog).getByRole('button', { name: 'Turn off and delete' }),
      );

      await waitFor(() =>
        expect(mockEnqueue).toHaveBeenCalledWith(
          'Turning off the Assistant failed. Please try again.',
          { variant: 'error' },
        ),
      );
      expect(mutationSpy).not.toHaveGraphqlOperation('UpdateAssistantSettings');
    });
  });
});
