import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import userEvent from '@testing-library/user-event';
import { render, waitFor } from '__tests__/util/testingLibraryReactMock';
import theme from 'src/theme';
import { ModalAccordion } from './ModalAccordion';

const title = 'Test title';
const subtitle = 'Test subtitle';

interface TestComponentProps {
  onForm?: boolean;
}

const TestComponent: React.FC<TestComponentProps> = ({ onForm = false }) => {
  return (
    <ThemeProvider theme={theme}>
      <ModalAccordion
        icon={() => <div>Icon</div>}
        title={title}
        titleColor="info.dark"
        subtitle={subtitle}
        onForm={onForm}
      >
        {<div>Children</div>}
      </ModalAccordion>
    </ThemeProvider>
  );
};

describe('ModalAccordion', () => {
  it('starts collapsed by default', () => {
    const { getByRole, getByText } = render(<TestComponent />);

    const expandButton = getByRole('button', {
      name: 'Expand salary details',
    });
    expect(expandButton).toHaveAttribute('aria-expanded', 'false');

    expect(getByText('Children')).not.toBeVisible();
  });

  it('starts expanded when onForm is true', () => {
    const { getByText } = render(<TestComponent onForm={true} />);

    expect(getByText(title)).toBeInTheDocument();
    expect(getByText(subtitle)).toBeInTheDocument();
    expect(getByText('Children')).toBeInTheDocument();
  });

  it('expands when clicked', async () => {
    const { getByRole, getByText } = render(<TestComponent />);

    const expandButton = getByRole('button', {
      name: 'Expand salary details',
    });
    expect(expandButton).toHaveAttribute('aria-expanded', 'false');

    userEvent.click(expandButton);

    await waitFor(() => {
      expect(getByText('Children')).toBeInTheDocument();
    });

    userEvent.click(expandButton);

    await waitFor(() => {
      expect(getByText('Children')).not.toBeVisible();
    });
  });
});
