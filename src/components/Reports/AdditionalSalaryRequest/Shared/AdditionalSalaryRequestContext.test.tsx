import React from 'react';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import { AdditionalSalaryRequestTestWrapper } from '../AdditionalSalaryRequestTestWrapper';
import { useAdditionalSalaryRequest } from './AdditionalSalaryRequestContext';
import { getHeader } from './Helper/getHeader';

const mutationSpy = jest.fn();
const mockEnqueue = jest.fn();

jest.mock('notistack', () => ({
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  ...jest.requireActual('notistack'),
  useSnackbar: () => {
    return {
      enqueueSnackbar: mockEnqueue,
    };
  },
}));

const TestComponent: React.FC = () => {
  const {
    currentIndex,
    handleNextStep,
    isDrawerOpen,
    toggleDrawer,
    handleDeleteRequest,
  } = useAdditionalSalaryRequest();

  return (
    <div>
      <h2>{getHeader(currentIndex)}</h2>
      <div aria-label="drawer state" data-open={isDrawerOpen}>
        Drawer: {isDrawerOpen ? 'open' : 'closed'}
      </div>
      <button onClick={handleNextStep}>Change Section</button>
      <button onClick={toggleDrawer}>Toggle Drawer</button>

      <button onClick={() => handleDeleteRequest('test-id')}>
        Delete Request
      </button>
    </div>
  );
};

interface TestWrapperProps {
  onCall?: jest.Mock;
}

const TestWrapper: React.FC<TestWrapperProps> = ({ onCall }) => (
  <AdditionalSalaryRequestTestWrapper onCall={onCall}>
    <SnackbarProvider>
      <TestComponent />
    </SnackbarProvider>
  </AdditionalSalaryRequestTestWrapper>
);

describe('AdditionalSalaryRequestContext', () => {
  it('provides initial state', async () => {
    const { findByRole } = render(<TestWrapper />);

    expect(
      await findByRole('heading', { name: 'About this Form' }),
    ).toBeInTheDocument();
  });

  it('handles section change', async () => {
    const { getByRole, findByRole } = render(<TestWrapper />);

    userEvent.click(getByRole('button', { name: 'Change Section' }));
    expect(
      await findByRole('heading', { name: 'Complete the Form' }),
    ).toBeInTheDocument();
  });

  it('toggles drawer state', () => {
    const { getByRole, getByLabelText } = render(<TestWrapper />);

    const drawerState = getByLabelText('drawer state');
    expect(drawerState).toHaveAttribute('data-open', 'true');

    userEvent.click(getByRole('button', { name: 'Toggle Drawer' }));
    expect(drawerState).toHaveAttribute('data-open', 'false');
  });

  it('handles delete request', async () => {
    const { getByRole } = render(<TestWrapper onCall={mutationSpy} />);

    userEvent.click(getByRole('button', { name: 'Delete Request' }));

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation(
        'DeleteAdditionalSalaryRequest',
        {
          id: 'test-id',
        },
      ),
    );

    await waitFor(() => {
      expect(mockEnqueue).toHaveBeenCalledWith(
        'Additional Salary Request cancelled successfully.',
        { variant: 'success' },
      );
    });
  });
});
