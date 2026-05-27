import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { render } from '__tests__/util/testingLibraryReactMock';
import { blockImpersonatingNonDevelopers } from 'pages/api/utils/pagePropsHelpers';
import { PdsGoalCalculationQuery } from 'src/components/HrTools/PdsGoalCalculator/GoalsList/PdsGoalCalculations.generated';
import { GetUserQuery } from 'src/components/User/GetUser.generated';
import { UsStaffGroupEnum, UserTypeEnum } from 'src/graphql/types.generated';
import theme from 'src/theme';
import { PdsGoalCalculatorPage, getServerSideProps } from './[pdsGoalId].page';

interface AccessComponentsProps {
  userType?: UserTypeEnum;
  usStaffGroup?: UsStaffGroupEnum;
}

const AccessComponents: React.FC<AccessComponentsProps> = ({
  userType = UserTypeEnum.UsStaff,
  usStaffGroup = UsStaffGroupEnum.PaidWithDesignation,
}) => (
  <ThemeProvider theme={theme}>
    <TestRouter
      router={{
        query: { accountListId: 'account-list-1', pdsGoalId: 'pds-goal-1' },
      }}
    >
      <SnackbarProvider>
        <GqlMockedProvider<{
          GetUser: GetUserQuery;
          PdsGoalCalculation: PdsGoalCalculationQuery;
        }>
          mocks={{
            GetUser: { user: { userType, usStaffGroup } },
            PdsGoalCalculation: {
              designationSupportCalculation: {
                updatedAt: '2024-01-01T00:00:00.000Z',
              },
            },
          }}
        >
          <PdsGoalCalculatorPage />
        </GqlMockedProvider>
      </SnackbarProvider>
    </TestRouter>
  </ThemeProvider>
);

describe('[pdsGoalId] page', () => {
  it('uses blockImpersonatingNonDevelopers for server-side props', () => {
    expect(getServerSideProps).toBe(blockImpersonatingNonDevelopers);
  });

  it('should show limited access for a non-Cru user', async () => {
    const { findByText } = render(
      <AccessComponents userType={UserTypeEnum.NonCru} />,
    );

    expect(
      await findByText('Access to this feature is limited.'),
    ).toBeInTheDocument();
  });

  it('should show limited access when incorrect usStaffGroup', async () => {
    const { findByText } = render(
      <AccessComponents usStaffGroup={UsStaffGroupEnum.NewStaff} />,
    );

    expect(
      await findByText('Access to this feature is limited.'),
    ).toBeInTheDocument();
  });

  it('renders Saving indicator for an eligible US Staff user', async () => {
    const { findByText } = render(<AccessComponents />);

    expect(await findByText(/Last saved/)).toBeInTheDocument();
  });
});
