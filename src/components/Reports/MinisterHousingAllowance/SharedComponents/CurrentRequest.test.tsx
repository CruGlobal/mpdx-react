import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, screen, waitFor } from '@testing-library/react';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { MhaStatusEnum } from 'src/graphql/types.generated';
import theme from 'src/theme';
import { DeleteMinistryHousingAllowanceRequestMutation } from '../MinisterHousingAllowance.generated';
import {
  ContextType,
  MinisterHousingAllowanceContext,
} from '../Shared/Context/MinisterHousingAllowanceContext';
import { mockMHARequest } from '../mockData';
import { CurrentRequest, getDotColor, getDotVariant } from './CurrentRequest';

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
  return (
    <ThemeProvider theme={theme}>
      <SnackbarProvider>
        <GqlMockedProvider<{
          DeleteMinistryHousingAllowanceRequest: DeleteMinistryHousingAllowanceRequestMutation;
        }>
          onCall={mutationSpy}
        >
          <MinisterHousingAllowanceContext.Provider
            value={
              {
                requestId: 'request-id',
              } as unknown as ContextType
            }
          >
            <TestRouter>
              <CurrentRequest request={mockMHARequest} />
            </TestRouter>
          </MinisterHousingAllowanceContext.Provider>
        </GqlMockedProvider>
      </SnackbarProvider>
    </ThemeProvider>
  );
};

describe('CurrentRequest Component', () => {
  it('should render correctly', () => {
    const { getByText, queryByText } = render(<TestComponent />);

    expect(getByText('Current MHA Request')).toBeInTheDocument();
    expect(getByText('View Request')).toBeInTheDocument();

    expect(
      getByText(/this request is still pending board approval/i),
    ).toBeInTheDocument();
    expect(queryByText('Edit Request')).not.toBeInTheDocument();

    expect(getByText('$15,000.00')).toBeInTheDocument();

    screen.logTestingPlaygroundURL();

    expect(getByText(/Requested on: Oct 1, 2019/i)).toBeInTheDocument();
    expect(
      getByText(/Deadline for changes: Oct 23, 2019/i),
    ).toBeInTheDocument();
    expect(getByText(/Board Approval on: Oct 30, 2019/i)).toBeInTheDocument();
    expect(getByText(/MHA Available on: Nov 20, 2019/i)).toBeInTheDocument();
  });

  it('should call delete mutation on cancel request', async () => {
    const { getByText, findByText } = render(<TestComponent />);

    const cancelButton = getByText('Cancel Request');
    cancelButton.click();

    const confirmButton = await findByText('Yes, Cancel');
    confirmButton.click();

    await waitFor(() => {
      expect(mutationSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          operation: expect.objectContaining({
            operationName: 'DeleteMinistryHousingAllowanceRequest',
            variables: {
              input: {
                requestId: '1',
              },
            },
          }),
        }),
      );
    });

    await waitFor(() => {
      expect(mockEnqueue).toHaveBeenCalledWith(
        expect.stringContaining('MHA request cancelled successfully.'),
        { variant: 'success' },
      );
    });
  });
});

describe('getDotColor', () => {
  describe('submitted step', () => {
    it('returns info.main when status is InProgress', () => {
      expect(getDotColor(MhaStatusEnum.InProgress, 'submitted')).toBe(
        'info.main',
      );
    });

    it('returns success.main for other statuses', () => {
      expect(getDotColor(MhaStatusEnum.Pending, 'submitted')).toBe(
        'success.main',
      );
      expect(getDotColor(MhaStatusEnum.ActionRequired, 'submitted')).toBe(
        'success.main',
      );
    });
  });

  describe('inProcess step', () => {
    it('returns info.main when status is Pending', () => {
      expect(getDotColor(MhaStatusEnum.Pending, 'inProcess')).toBe('info.main');
    });

    it('returns transparent when status is InProgress', () => {
      expect(getDotColor(MhaStatusEnum.InProgress, 'inProcess')).toBe(
        'transparent',
      );
    });

    it('returns warning.main when status is ActionRequired', () => {
      expect(getDotColor(MhaStatusEnum.ActionRequired, 'inProcess')).toBe(
        'warning.main',
      );
    });

    it('returns success.main for completed statuses', () => {
      expect(getDotColor(MhaStatusEnum.HrApproved, 'inProcess')).toBe(
        'success.main',
      );
      expect(getDotColor(MhaStatusEnum.BoardApproved, 'inProcess')).toBe(
        'success.main',
      );
    });
  });

  describe('deadline step', () => {
    it('returns info.main when status is Pending', () => {
      expect(getDotColor(MhaStatusEnum.Pending, 'deadline')).toBe('info.main');
    });

    it('returns transparent when status is InProgress or ActionRequired', () => {
      expect(getDotColor(MhaStatusEnum.InProgress, 'deadline')).toBe(
        'transparent',
      );
      expect(getDotColor(MhaStatusEnum.ActionRequired, 'deadline')).toBe(
        'transparent',
      );
    });

    it('returns success.main for completed statuses', () => {
      expect(getDotColor(MhaStatusEnum.HrApproved, 'deadline')).toBe(
        'success.main',
      );
      expect(getDotColor(MhaStatusEnum.BoardApproved, 'deadline')).toBe(
        'success.main',
      );
    });
  });

  describe('boardApproval step', () => {
    it('returns info.main when status is HrApproved', () => {
      expect(getDotColor(MhaStatusEnum.HrApproved, 'boardApproval')).toBe(
        'info.main',
      );
    });

    it('returns success.main when status is BoardApproved', () => {
      expect(getDotColor(MhaStatusEnum.BoardApproved, 'boardApproval')).toBe(
        'success.main',
      );
    });

    it('returns transparent for earlier statuses', () => {
      expect(getDotColor(MhaStatusEnum.Pending, 'boardApproval')).toBe(
        'transparent',
      );
      expect(getDotColor(MhaStatusEnum.InProgress, 'boardApproval')).toBe(
        'transparent',
      );
    });
  });

  describe('available step', () => {
    it('always returns transparent', () => {
      expect(getDotColor(MhaStatusEnum.Pending, 'available')).toBe(
        'transparent',
      );
      expect(getDotColor(MhaStatusEnum.InProgress, 'available')).toBe(
        'transparent',
      );
      expect(getDotColor(MhaStatusEnum.BoardApproved, 'available')).toBe(
        'transparent',
      );
    });
  });
});

describe('getDotVariant', () => {
  describe('submitted step', () => {
    it('always returns filled', () => {
      expect(getDotVariant(MhaStatusEnum.InProgress, 'submitted')).toBe(
        'filled',
      );
      expect(getDotVariant(MhaStatusEnum.Pending, 'submitted')).toBe('filled');
    });
  });

  describe('inProcess step', () => {
    it('returns outlined when status is InProgress', () => {
      expect(getDotVariant(MhaStatusEnum.InProgress, 'inProcess')).toBe(
        'outlined',
      );
    });

    it('returns filled for other statuses', () => {
      expect(getDotVariant(MhaStatusEnum.Pending, 'inProcess')).toBe('filled');
      expect(getDotVariant(MhaStatusEnum.ActionRequired, 'inProcess')).toBe(
        'filled',
      );
    });
  });

  describe('deadline step', () => {
    it('returns filled when status is Pending, HrApproved, or BoardApproved', () => {
      expect(getDotVariant(MhaStatusEnum.Pending, 'deadline')).toBe('filled');
      expect(getDotVariant(MhaStatusEnum.HrApproved, 'deadline')).toBe(
        'filled',
      );
      expect(getDotVariant(MhaStatusEnum.BoardApproved, 'deadline')).toBe(
        'filled',
      );
    });

    it('returns outlined for other statuses', () => {
      expect(getDotVariant(MhaStatusEnum.InProgress, 'deadline')).toBe(
        'outlined',
      );
      expect(getDotVariant(MhaStatusEnum.ActionRequired, 'deadline')).toBe(
        'outlined',
      );
    });
  });

  describe('boardApproval step', () => {
    it('returns filled when status is HrApproved or BoardApproved', () => {
      expect(getDotVariant(MhaStatusEnum.HrApproved, 'boardApproval')).toBe(
        'filled',
      );
      expect(getDotVariant(MhaStatusEnum.BoardApproved, 'boardApproval')).toBe(
        'filled',
      );
    });

    it('returns outlined for other statuses', () => {
      expect(getDotVariant(MhaStatusEnum.Pending, 'boardApproval')).toBe(
        'outlined',
      );
      expect(getDotVariant(MhaStatusEnum.InProgress, 'boardApproval')).toBe(
        'outlined',
      );
    });
  });

  describe('available step', () => {
    it('always returns outlined', () => {
      expect(getDotVariant(MhaStatusEnum.Pending, 'available')).toBe(
        'outlined',
      );
      expect(getDotVariant(MhaStatusEnum.BoardApproved, 'available')).toBe(
        'outlined',
      );
    });
  });
});
