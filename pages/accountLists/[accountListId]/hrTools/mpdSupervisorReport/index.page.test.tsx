import { ThemeProvider } from '@emotion/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { render } from '__tests__/util/testingLibraryReactMock';
import {
  afterTestResizeObserver,
  beforeTestResizeObserver,
} from '__tests__/util/windowResizeObserver';
import { blockImpersonatingNonDevelopers } from 'pages/api/utils/pagePropsHelpers';
import { GetUserQuery } from 'src/components/User/GetUser.generated';
import { UsStaffGroupEnum, UserTypeEnum } from 'src/graphql/types.generated';
import theme from 'src/theme';
import { MpdSupervisorReportPage, getServerSideProps } from './index.page';

const mutationSpy = jest.fn();
interface ComponentProps {
  userType?: UserTypeEnum;
  usStaffGroup?: UsStaffGroupEnum;
  supervisesStaff?: boolean;
}

const Components: React.FC<ComponentProps> = ({
  userType = UserTypeEnum.UsStaff,
  usStaffGroup = UsStaffGroupEnum.SeniorStaff,
  supervisesStaff = true,
}) => (
  <ThemeProvider theme={theme}>
    <SnackbarProvider>
      <TestRouter>
        <GqlMockedProvider<{
          GetUser: GetUserQuery;
        }>
          mocks={{
            GetUser: {
              user: { userType, usStaffGroup, supervisesStaff },
            },
          }}
          onCall={mutationSpy}
        >
          <MpdSupervisorReportPage />
        </GqlMockedProvider>
      </TestRouter>
    </SnackbarProvider>
  </ThemeProvider>
);

describe('MPD Supervisor Page', () => {
  beforeEach(() => {
    beforeTestResizeObserver();
  });

  afterEach(() => {
    afterTestResizeObserver();
  });

  it('uses blockImpersonatingNonDevelopers for server-side props', () => {
    expect(getServerSideProps).toBe(blockImpersonatingNonDevelopers);
  });

  it('should show initial MPD supervisor report page', async () => {
    const { findAllByRole } = render(<Components />);

    const heading = await findAllByRole('heading', {
      name: /mpd supervisor report/i,
    });
    expect(heading[0]).toBeInTheDocument();
  });

  it('should open and close menu', async () => {
    const { findByRole, getByRole, queryByRole } = render(<Components />);

    userEvent.click(
      await findByRole('button', { name: 'Toggle HR Tools Menu' }),
    );
    expect(getByRole('heading', { name: 'HR Tools' })).toBeInTheDocument();
    userEvent.click(getByRole('img', { name: 'Close' }));
    expect(
      queryByRole('heading', { name: 'HR Tools' }),
    ).not.toBeInTheDocument();
  });

  it('should show limited access if user does not have access to page', async () => {
    const { findByText } = render(
      <Components userType={UserTypeEnum.NonCru} />,
    );

    expect(
      await findByText('Access to this feature is limited.'),
    ).toBeInTheDocument();
  });

  it('should show limited access if the user supervises no staff', async () => {
    const { findByText, queryByRole } = render(
      <Components supervisesStaff={false} />,
    );

    expect(
      await findByText(/our records show that you do not supervise any staff/i),
    ).toBeInTheDocument();
    expect(
      queryByRole('heading', { name: /mpd supervisor report/i }),
    ).not.toBeInTheDocument();
  });
});
