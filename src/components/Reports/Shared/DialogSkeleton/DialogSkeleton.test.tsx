import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import theme from 'src/theme';
import { DialogSkeleton, DialogSkeletonProps } from './DialogSkeleton';

const defaultProps: DialogSkeletonProps = {
  categoryName: 'Salary',
  open: true,
  onClose: jest.fn(),
};

const mutationSpy = jest.fn();

const TestComponent: React.FC<DialogSkeletonProps> = (props) => (
  <ThemeProvider theme={theme}>
    <DialogSkeleton {...props}>
      <span>Dialog content</span>
    </DialogSkeleton>
  </ThemeProvider>
);

describe('DialogSkeleton', () => {
  it('renders dialog when open is true', () => {
    const { getByRole } = render(<TestComponent {...defaultProps} />);

    expect(getByRole('dialog')).toBeInTheDocument();
  });

  it('does not render dialog when open is false', () => {
    const { queryByRole } = render(
      <TestComponent {...defaultProps} open={false} />,
    );

    expect(queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('titles the dialog with the category name', () => {
    const { getByText } = render(<TestComponent {...defaultProps} />);

    expect(getByText('Salary Breakdown')).toBeInTheDocument();
  });

  it('renders its children', () => {
    const { getByText } = render(<TestComponent {...defaultProps} />);

    expect(getByText('Dialog content')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const { getByTestId } = render(
      <TestComponent {...defaultProps} onClose={mutationSpy} />,
    );

    userEvent.click(getByTestId('close-button'));

    expect(mutationSpy).toHaveBeenCalled();
  });
});
