import { ThemeProvider } from '@mui/material/styles';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { render } from '__tests__/util/testingLibraryReactMock';
import { blockImpersonatingNonDevelopers } from 'pages/api/utils/pagePropsHelpers';
import { NewStaffQuestionnaireQuery } from 'src/components/HrTools/NsoMpdQuestionnaire/Shared/NewStaffQuestionnaire.generated';
import { GetUserQuery } from 'src/components/User/GetUser.generated';
import { UsStaffGroupEnum, UserTypeEnum } from 'src/graphql/types.generated';
import theme from 'src/theme';
import { NsoMpdQuestionnairePage, getServerSideProps } from './index.page';

interface TestComponentProps {
  userType?: UserTypeEnum;
  usStaffGroup?: UsStaffGroupEnum;
  updatedAt?: string;
}

const TestComponent: React.FC<TestComponentProps> = ({
  userType = UserTypeEnum.UsStaff,
  usStaffGroup = UsStaffGroupEnum.NewStaff,
  updatedAt = '2026-06-30T11:55:00.000Z',
}) => (
  <TestRouter>
    <ThemeProvider theme={theme}>
      <GqlMockedProvider<{
        GetUser: GetUserQuery;
        NewStaffQuestionnaire: NewStaffQuestionnaireQuery;
      }>
        mocks={{
          GetUser: { user: { userType, usStaffGroup } },
          NewStaffQuestionnaire: {
            newStaffQuestionnaire: { updatedAt },
          },
        }}
      >
        <NsoMpdQuestionnairePage />
      </GqlMockedProvider>
    </ThemeProvider>
  </TestRouter>
);

describe('NsoMpdQuestionnaire page', () => {
  it('uses blockImpersonatingNonDevelopers for server-side props', () => {
    expect(getServerSideProps).toBe(blockImpersonatingNonDevelopers);
  });

  it('renders the questionnaire when the user is eligible (New Staff)', async () => {
    const { findByRole } = render(<TestComponent />);

    expect(
      await findByRole('button', { name: 'Questionnaire Step 1' }),
    ).toHaveAttribute('aria-current', 'step');
  });

  it('shows the last saved status from the questionnaire updatedAt', async () => {
    const { findByText } = render(<TestComponent />);

    expect(await findByText(/Last saved/)).toBeInTheDocument();
  });

  it('shows limited access when the user is ineligible', async () => {
    const { findByText } = render(
      <TestComponent usStaffGroup={UsStaffGroupEnum.PaidWithDesignation} />,
    );

    expect(
      await findByText('Access to this feature is limited.'),
    ).toBeInTheDocument();
  });
});
