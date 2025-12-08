import { ThemeProvider } from '@mui/material/styles';
import { renderHook, waitFor } from '@testing-library/react';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { PageEnum } from 'src/components/Reports/Shared/CalculationReports/Shared/sharedTypes';
import theme from 'src/theme';
import { UpdateMinistryHousingAllowanceRequestMutation } from '../../MinisterHousingAllowance.generated';
import {
  ContextType,
  MinisterHousingAllowanceContext,
} from '../Context/MinisterHousingAllowanceContext';
import { useSaveField } from './useSaveField';

const mutationSpy = jest.fn();

interface TestComponentProps {
  children: React.ReactNode;
}

const TestComponent: React.FC<TestComponentProps> = ({ children }) => {
  return (
    <ThemeProvider theme={theme}>
      <GqlMockedProvider<{
        UpdateMinistryHousingAllowanceRequest: UpdateMinistryHousingAllowanceRequestMutation;
      }>
        onCall={mutationSpy}
      >
        <MinisterHousingAllowanceContext.Provider
          value={
            {
              pageType: PageEnum.New,
              requestData: {
                id: 'request-id',
                requestAttributes: { rentalValue: 50 },
              },
            } as unknown as ContextType
          }
        >
          {children}
        </MinisterHousingAllowanceContext.Provider>
      </GqlMockedProvider>
    </ThemeProvider>
  );
};

describe('useSaveField', () => {
  it('should update ministry housing allowance request', async () => {
    const { result } = renderHook(
      () =>
        useSaveField({
          formValues: { rentalValue: 50 },
        }),
      {
        wrapper: TestComponent,
      },
    );

    result.current({ rentalValue: 100 });

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation(
        'UpdateMinistryHousingAllowanceRequest',
        {
          input: {
            requestId: 'request-id',
            requestAttributes: {
              rentalValue: 100,
            },
          },
        },
      ),
    );
  });
});
