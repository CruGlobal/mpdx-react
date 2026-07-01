import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import theme from 'src/theme';
import { QuestionnaireActionButton } from './QuestionnaireActionButton';

const renderButton = (
  props: Partial<React.ComponentProps<typeof QuestionnaireActionButton>> = {},
) =>
  render(
    <ThemeProvider theme={theme}>
      <QuestionnaireActionButton
        onClick={props.onClick ?? jest.fn()}
        {...props}
      >
        {props.children ?? 'Continue'}
      </QuestionnaireActionButton>
    </ThemeProvider>,
  );

describe('QuestionnaireActionButton', () => {
  it('calls onClick when clicked', () => {
    const onClick = jest.fn();
    const { getByRole } = renderButton({ onClick });

    userEvent.click(getByRole('button', { name: 'Continue' }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('renders as disabled when disabled is set', () => {
    const { getByRole } = renderButton({ disabled: true });

    expect(getByRole('button', { name: 'Continue' })).toBeDisabled();
  });
});
