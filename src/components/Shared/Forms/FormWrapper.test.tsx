import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import theme from 'src/theme';
import { FormWrapper } from './FormWrapper';

describe('FormWrapper', () => {
  it('Should render children and default save button', () => {
    const { getByText, getByRole } = render(
      <ThemeProvider theme={theme}>
        <FormWrapper
          onSubmit={() => true}
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
  it('Should render custom button text', () => {
    const { getByRole } = render(
      <ThemeProvider theme={theme}>
        <FormWrapper
          onSubmit={() => true}
          isValid={true}
          isSubmitting={false}
          buttonText={'Confirm'}
        >
          Children
        </FormWrapper>
      </ThemeProvider>,
    );

    expect(getByRole('button', { name: 'Confirm' })).toBeInTheDocument();
  });
});
