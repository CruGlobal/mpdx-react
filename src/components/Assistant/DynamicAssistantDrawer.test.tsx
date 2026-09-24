import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestRouter from '__tests__/util/TestRouter';
import theme from 'src/theme';
import { AssistantProvider, useAssistantContext } from './AssistantProvider';
import { DynamicAssistantDrawer } from './DynamicAssistantDrawer';
import { useAssistantVisibility } from './useAssistantVisibility';

jest.mock('./useAssistantVisibility');
const mockUseAssistantVisibility = useAssistantVisibility as jest.MockedFn<
  typeof useAssistantVisibility
>;

const OpenButton: React.FC = () => {
  const { openAssistant } = useAssistantContext();
  return <button onClick={openAssistant}>Open</button>;
};

const TestComponent: React.FC = () => (
  <ThemeProvider theme={theme}>
    <TestRouter>
      <AssistantProvider>
        <OpenButton />
        <DynamicAssistantDrawer />
      </AssistantProvider>
    </TestRouter>
  </ThemeProvider>
);

describe('DynamicAssistantDrawer', () => {
  beforeEach(() => {
    mockUseAssistantVisibility.mockReturnValue(true);
  });

  it('renders nothing until the assistant is opened', async () => {
    const { getByRole, queryByRole, findByRole } = render(<TestComponent />);

    expect(queryByRole('dialog')).not.toBeInTheDocument();
    expect(queryByRole('progressbar')).not.toBeInTheDocument();

    userEvent.click(getByRole('button', { name: 'Open' }));

    expect(
      await findByRole('dialog', { name: 'Assistant' }),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(queryByRole('progressbar')).not.toBeInTheDocument(),
    );
  });
});
