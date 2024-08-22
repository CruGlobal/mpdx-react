import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import theme from 'src/theme';
import {
  AppealsListFilterPanelButton,
  AppealsListFilterPanelButtonProps,
} from './AppealsListFilterPanelButton';

const onClick = jest.fn();
const initialProps = {
  title: 'Test Title',
  onClick,
  buttonText: 'buttonText',
  disabled: false,
};

const Components = (props: AppealsListFilterPanelButtonProps) => (
  <ThemeProvider theme={theme}>
    <AppealsListFilterPanelButton {...props} />
  </ThemeProvider>
);

describe('AppealsListFilterPanelButton', () => {
  it('default', () => {
    const { getByText } = render(<Components {...initialProps} />);

    expect(getByText(initialProps.title)).toBeInTheDocument();
    expect(getByText(initialProps.buttonText)).toBeInTheDocument();
  });

  it('should be disabled', () => {
    const { getByText } = render(
      <Components {...initialProps} disabled={true} />,
    );
    expect(getByText(initialProps.buttonText)).toBeDisabled();
  });

  it('should fire onClick', () => {
    const { getByText } = render(<Components {...initialProps} />);

    expect(onClick).not.toHaveBeenCalled();
    userEvent.click(getByText(initialProps.buttonText));
    expect(onClick).toHaveBeenCalled();
  });
});
