import { ThemeProvider } from '@mui/material/styles';
import { renderHook, waitFor } from '@testing-library/react';
import { SnackbarProvider } from 'notistack';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { PageEnum } from 'src/components/Reports/Shared/CalculationReports/Shared/sharedTypes';
import theme from 'src/theme';
import { UpdateMinistryHousingAllowanceRequestMutation } from '../../MinisterHousingAllowance.generated';
import { mockMHARequest } from '../../mockData';
import {
  ContextType,
  MinisterHousingAllowanceContext,
} from '../Context/MinisterHousingAllowanceContext';
import { useSaveField } from './useSaveField';

const mutationSpy = jest.fn();

interface TestComponentProps {
  children: React.ReactNode;
  userEligibleForMHA?: boolean;
}

const TestComponent: React.FC<TestComponentProps> = ({
  children,
  userEligibleForMHA = true,
}) => {
  return (
    <ThemeProvider theme={theme}>
      <SnackbarProvider>
        <GqlMockedProvider<{
          UpdateMinistryHousingAllowanceRequest: UpdateMinistryHousingAllowanceRequestMutation;
        }>
          onCall={mutationSpy}
        >
          <MinisterHousingAllowanceContext.Provider
            value={
              {
                pageType: PageEnum.New,
                requestData: mockMHARequest,
                userEligibleForMHA,
              } as unknown as ContextType
            }
          >
            {children}
          </MinisterHousingAllowanceContext.Provider>
        </GqlMockedProvider>
      </SnackbarProvider>
    </ThemeProvider>
  );
};

describe('useSaveField', () => {
  it('should update ministry housing allowance request when user is eligible', async () => {
    const { result } = renderHook(
      () =>
        useSaveField({
          formValues: { rentalValue: 50 },
        }),
      {
        wrapper: ({ children }) => (
          <TestComponent userEligibleForMHA={true}>{children}</TestComponent>
        ),
      },
    );

    result.current({ rentalValue: 100 });

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation(
        'UpdateMinistryHousingAllowanceRequest',
        {
          input: {
            requestId: '1',
            requestAttributes: {
              rentalValue: 100,
            },
          },
        },
      ),
    );
  });

  it('should block mutation when user is not eligible', async () => {
    const { result } = renderHook(
      () =>
        useSaveField({
          formValues: { rentalValue: 50 },
        }),
      {
        wrapper: ({ children }) => (
          <TestComponent userEligibleForMHA={false}>{children}</TestComponent>
        ),
      },
    );

    result.current({ rentalValue: 100 });

    await waitFor(() => {
      expect(mutationSpy).not.toHaveGraphqlOperation(
        'UpdateMinistryHousingAllowanceRequest',
      );
    });
  });
});
