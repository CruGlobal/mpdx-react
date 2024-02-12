import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import theme from 'src/theme';
import { FormWrapper } from './FormWrapper';

const mockOnSubmit = jest.fn();

describe('FormWrapper', () => {
  it('Should render children and default save button', () => {
    const { getByText, getByRole } = render(
      <ThemeProvider theme={theme}>
        <FormWrapper
          onSubmit={mockOnSubmit}
          isValid={true}
          isSubmitting={false}
          buttonText={''}
        >
          Children
        </FormWrapper>
      </ThemeProvider>,
    );

    expect(getByText('Children')).toBeInTheDocument();
    expect(getByRole('button', { name: 'Save' })).toBeInTheDocument();
  });
  it('Should render custom button text', async () => {
    const { getByRole } = render(
      <ThemeProvider theme={theme}>
        <FormWrapper
          onSubmit={mockOnSubmit}
          isValid={true}
          isSubmitting={false}
          buttonText={'Confirm'}
        >
          Children
        </FormWrapper>
      </ThemeProvider>,
    );
    const button = getByRole('button', { name: 'Confirm' });

    expect(button).toBeInTheDocument();
    userEvent.click(button);
    expect(mockOnSubmit).toHaveBeenCalled();
  });
});
