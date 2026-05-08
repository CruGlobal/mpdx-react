import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DesignationSupportFormType } from 'src/graphql/types.generated';
import theme from 'src/theme';
import { CreateGoalDialog } from './CreateGoalDialog';

const renderDialog = (
  props: Partial<React.ComponentProps<typeof CreateGoalDialog>> = {},
) => {
  const defaults = {
    open: true,
    onClose: jest.fn(),
    onCreate: jest.fn().mockResolvedValue(undefined),
  };
  const utils = render(
    <ThemeProvider theme={theme}>
      <CreateGoalDialog {...defaults} {...props} />
    </ThemeProvider>,
  );
  const rerenderDialog = (
    nextProps: Partial<React.ComponentProps<typeof CreateGoalDialog>> = {},
  ) =>
    utils.rerender(
      <ThemeProvider theme={theme}>
        <CreateGoalDialog {...defaults} {...nextProps} />
      </ThemeProvider>,
    );
  return { ...utils, rerenderDialog };
};

describe('CreateGoalDialog', () => {
  it('renders both form-type options with descriptions', () => {
    const { getByRole, getByText } = renderDialog();
    expect(getByRole('radio', { name: /Default/ })).toBeInTheDocument();
    expect(getByRole('radio', { name: /Simple/ })).toBeInTheDocument();
    expect(
      getByText(
        'Full calculator with reimbursable expenses and 403b contributions.',
      ),
    ).toBeInTheDocument();
    expect(
      getByText(
        'Streamlined calculator without reimbursable expenses or 403b contributions.',
      ),
    ).toBeInTheDocument();
  });

  it('disables the Create button until a form type is picked', () => {
    const { getByRole } = renderDialog();
    expect(getByRole('button', { name: 'Create' })).toBeDisabled();
  });

  it('enables Create after a form type is picked', () => {
    const { getByRole } = renderDialog();
    userEvent.click(getByRole('radio', { name: /Simple/ }));
    expect(getByRole('button', { name: 'Create' })).toBeEnabled();
  });

  it('calls onCreate with the chosen form type when Create is clicked', async () => {
    const onCreate = jest.fn().mockResolvedValue(undefined);
    const { getByRole } = renderDialog({ onCreate });

    userEvent.click(getByRole('radio', { name: /Simple/ }));
    userEvent.click(getByRole('button', { name: 'Create' }));

    await waitFor(() =>
      expect(onCreate).toHaveBeenCalledWith(DesignationSupportFormType.Simple),
    );
  });

  it('calls onClose when Cancel is clicked', () => {
    const onClose = jest.fn();
    const { getByRole } = renderDialog({ onClose });
    userEvent.click(getByRole('button', { name: 'Cancel' }));
    expect(onClose).toHaveBeenCalled();
  });

  it('disables Create but keeps Cancel enabled while submitting', async () => {
    const onCreate = jest.fn().mockReturnValue(new Promise<void>(() => {}));
    const { getByRole } = renderDialog({ onCreate });

    userEvent.click(getByRole('radio', { name: /Simple/ }));
    userEvent.click(getByRole('button', { name: 'Create' }));

    await waitFor(() =>
      expect(getByRole('button', { name: 'Create' })).toBeDisabled(),
    );
    expect(getByRole('button', { name: 'Cancel' })).toBeEnabled();
  });

  it('does not render when open is false', () => {
    const { queryByRole } = renderDialog({ open: false });
    expect(queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('clears the selected option when reopened after Cancel', () => {
    const { getByRole, rerenderDialog } = renderDialog();

    userEvent.click(getByRole('radio', { name: /Simple/ }));
    userEvent.click(getByRole('button', { name: 'Cancel' }));

    rerenderDialog({ open: false });
    rerenderDialog({ open: true });

    expect(getByRole('button', { name: 'Create' })).toBeDisabled();
  });
});
