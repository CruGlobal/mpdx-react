import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mockSession } from '__tests__/util/mockSession';
import theme from 'src/theme';
import { AssistantDrawer } from './AssistantDrawer';
import { AssistantProvider, useAssistantContext } from './AssistantProvider';

const OpenButton: React.FC = () => {
  const { openAssistant } = useAssistantContext();
  return <button onClick={openAssistant}>Open</button>;
};

const TestComponent: React.FC = () => (
  <ThemeProvider theme={theme}>
    <AssistantProvider>
      <OpenButton />
      <AssistantDrawer />
    </AssistantProvider>
  </ThemeProvider>
);

describe('AssistantDrawer', () => {
  beforeEach(() => {
    process.env.DEVELOPMENT_ENV = 'true';
    process.env.DISABLE_ASSISTANT = 'false';
    mockSession({ developer: true, impersonating: false });
  });

  afterEach(() => {
    process.env.DEVELOPMENT_ENV = 'false';
    process.env.DISABLE_ASSISTANT = 'false';
  });

  it('is closed by default', () => {
    const { queryByRole } = render(<TestComponent />);

    expect(queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('shows the header, placeholder, disabled input, and footer when open', () => {
    const { getByRole, getByText, getByPlaceholderText } = render(
      <TestComponent />,
    );

    userEvent.click(getByRole('button', { name: 'Open' }));

    expect(getByRole('dialog', { name: 'Assistant' })).toBeInTheDocument();
    expect(getByText('Ask a question to get started.')).toBeInTheDocument();
    expect(getByPlaceholderText('Ask the assistant')).toBeDisabled();
    expect(getByText('The assistant is coming soon.')).toBeInTheDocument();
  });

  it('closes when the close button is clicked', async () => {
    const { getByRole, queryByRole } = render(<TestComponent />);

    userEvent.click(getByRole('button', { name: 'Open' }));
    userEvent.click(getByRole('button', { name: 'Close Assistant' }));

    await waitFor(() => expect(queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('does not render when the assistant is hidden', () => {
    process.env.DISABLE_ASSISTANT = 'true';

    const { getByRole, queryByRole } = render(<TestComponent />);

    userEvent.click(getByRole('button', { name: 'Open' }));

    expect(queryByRole('dialog')).not.toBeInTheDocument();
  });
});
