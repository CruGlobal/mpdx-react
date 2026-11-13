import { HeadManagerContext } from 'next/dist/shared/lib/head-manager-context.shared-runtime';
import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { render } from '__tests__/util/testingLibraryReactMock';
import { blockImpersonatingNonDevelopers } from 'pages/api/utils/pagePropsHelpers';
import { HcmQuery } from 'src/components/HrTools/Shared/HcmData/Hcm.generated';
import { StaffAccountQuery } from 'src/components/Shared/StaffAccount/StaffAccount.generated';
import { GetUserQuery } from 'src/components/User/GetUser.generated';
import { UsStaffGroupEnum, UserTypeEnum } from 'src/graphql/types.generated';
import { getAppName } from 'src/lib/getAppName';
import theme from 'src/theme';
import { StaffSavingFundPage, getServerSideProps } from './index.page';

// Receives what next/head puts in the page head, like the browser tab title
const updateHead = jest.fn();

// The browser tab title next/head asked for last
const tabTitle = (): string | undefined => {
  const headElements: React.ReactElement[] = updateHead.mock.lastCall?.[0];
  return headElements?.find((element) => element.type === 'title')?.props
    .children;
};

interface ComponentsProps {
  userType?: UserTypeEnum;
}

const Components: React.FC<ComponentsProps> = ({
  userType = UserTypeEnum.NonCru,
}) => (
  <HeadManagerContext.Provider
    value={{ updateHead, mountedInstances: new Set() }}
  >
    <ThemeProvider theme={theme}>
      <TestRouter>
        <GqlMockedProvider<{
          GetUser: GetUserQuery;
          StaffAccount: StaffAccountQuery;
          Hcm: HcmQuery;
        }>
          mocks={{
            GetUser: {
              user: {
                userType,
                usStaffGroup: UsStaffGroupEnum.SeniorStaff,
                staffAccountId: 'staff-account-1',
              },
            },
            StaffAccount: {
              staffAccount: { id: 'staff-account-1', name: 'Test Account' },
            },
            Hcm: { hcm: [] },
          }}
        >
          <StaffSavingFundPage />
        </GqlMockedProvider>
      </TestRouter>
    </ThemeProvider>
  </HeadManagerContext.Provider>
);

describe('StaffSavingFund page', () => {
  it('uses blockImpersonatingNonDevelopers for server-side props', () => {
    expect(getServerSideProps).toBe(blockImpersonatingNonDevelopers);
  });

  it('should show limited access if user does not have access to page', async () => {
    const { findByText } = render(<Components />);

    expect(
      await findByText('Access to this feature is limited.'),
    ).toBeInTheDocument();
  });

  it('shows just the page name as the header title', async () => {
    const { findByRole, queryByRole } = render(
      <Components userType={UserTypeEnum.UsStaff} />,
    );

    const heading = await findByRole('heading', {
      name: 'Savings Fund Transfer',
    });
    expect(heading.closest('[test-dataid="MultiPageHeader"]')).not.toBeNull();
    expect(
      queryByRole('heading', { name: 'HR Tools | Savings Fund Transfer' }),
    ).not.toBeInTheDocument();
  });

  it('keeps HR Tools in the browser tab title', async () => {
    const { findByRole } = render(
      <Components userType={UserTypeEnum.UsStaff} />,
    );

    expect(
      await findByRole('heading', { name: 'Fund Transfer' }),
    ).toBeInTheDocument();
    expect(tabTitle()).toBe(
      `${getAppName()} | HR Tools | Savings Fund Transfer`,
    );
  });
});
