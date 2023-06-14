import { ThemeProvider } from '@emotion/react';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import theme from 'src/theme';
import { Confirmation } from './Confirmation';

const handleClose = jest.fn();
const mutation = jest.fn().mockResolvedValue(undefined);

const TestComponent: React.FC = () => (
  <ThemeProvider theme={theme}>
    <Confirmation
      isOpen
      title="Title"
      message="Message"
      handleClose={handleClose}
      mutation={mutation}
    />
  </ThemeProvider>
);

describe('Confirmation', () => {
  it('renders', () => {
    const { getByRole, getByText } = render(<TestComponent />);

    expect(getByRole('heading', { name: 'Title' })).toBeInTheDocument();
    expect(getByText('Message')).toBeInTheDocument();
  });

  it('no dismisses modal', () => {
    const { getByRole } = render(<TestComponent />);

    userEvent.click(getByRole('button', { name: 'No' }));
    expect(handleClose).toHaveBeenCalled();
    expect(mutation).not.toHaveBeenCalled();
  });

  it('yes performs mutation and closes modal after it succeeds', async () => {
    const { getByRole } = render(<TestComponent />);

    userEvent.click(getByRole('button', { name: 'Yes' }));
    expect(mutation).toHaveBeenCalled();
    await waitFor(() => expect(handleClose).toHaveBeenCalled());
  });

  it('yes performs mutation and closes modal after it fails', async () => {
    mutation.mockRejectedValue(new Error('Error'));

    const { getByRole } = render(<TestComponent />);

    userEvent.click(getByRole('button', { name: 'Yes' }));
    expect(mutation).toHaveBeenCalled();
    await waitFor(() => expect(handleClose).toHaveBeenCalled());
  });
});
