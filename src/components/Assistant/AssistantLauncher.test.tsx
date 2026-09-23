import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestRouter from '__tests__/util/TestRouter';
import { mockSession } from '__tests__/util/mockSession';
import theme from 'src/theme';
import { AssistantDrawer } from './AssistantDrawer';
import { AssistantLauncher } from './AssistantLauncher';
import { AssistantProvider } from './AssistantProvider';

const TestComponent: React.FC = () => (
  <ThemeProvider theme={theme}>
    <TestRouter>
      <AssistantProvider>
        <AssistantLauncher />
        <AssistantDrawer />
      </AssistantProvider>
    </TestRouter>
  </ThemeProvider>
);

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

  it('renders for a developer', () => {
    const { getByRole } = render(<TestComponent />);

    expect(getByRole('button', { name: 'Open Assistant' })).toBeInTheDocument();
  });

  it('is hidden when DISABLE_ASSISTANT is on', () => {
    process.env.DISABLE_ASSISTANT = 'true';

    const { queryByRole } = render(<TestComponent />);

    expect(
      queryByRole('button', { name: 'Open Assistant' }),
    ).not.toBeInTheDocument();
  });

  it('is hidden when impersonating', () => {
    mockSession({ developer: true, impersonating: true });

    const { queryByRole } = render(<TestComponent />);

    expect(
      queryByRole('button', { name: 'Open Assistant' }),
    ).not.toBeInTheDocument();
  });

  it('is hidden for a non-developer', () => {
    mockSession({ developer: false });

    const { queryByRole } = render(<TestComponent />);

    expect(
      queryByRole('button', { name: 'Open Assistant' }),
    ).not.toBeInTheDocument();
  });

  it('opens the drawer when clicked', () => {
    const { getByRole, queryByRole } = render(<TestComponent />);

    expect(queryByRole('dialog')).not.toBeInTheDocument();
    userEvent.click(getByRole('button', { name: 'Open Assistant' }));

    expect(getByRole('dialog', { name: 'Assistant' })).toBeInTheDocument();
  });
});
