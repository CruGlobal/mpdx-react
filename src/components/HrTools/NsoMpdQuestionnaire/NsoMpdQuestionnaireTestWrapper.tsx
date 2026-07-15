import { ThemeProvider } from '@mui/material/styles';
import { MockLinkCallHandler } from 'graphql-ergonomock/dist/apollo/MockLink';
import { merge } from 'lodash';
import { SnackbarProvider } from 'notistack';
import { DeepPartial } from 'ts-essentials';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { GetUserQuery } from 'src/components/User/GetUser.generated';
import {
  GoalCalculationAge,
  NewStaffQuestionnaireMaritalStatusEnum,
} from 'src/graphql/types.generated';
import { GoalCalculatorConstantsQuery } from 'src/hooks/goalCalculatorConstants.generated';
import theme from 'src/theme';
import { MinistriesQuery } from './MinistryInformation/Ministries.generated';
import { NewStaffQuestionnaireQuery } from './Shared/NewStaffQuestionnaire.generated';
import { NsoMpdQuestionnaireProvider } from './Shared/NsoMpdQuestionnaireContext';

export const newStaffQuestionnaireMock: DeepPartial<
  NewStaffQuestionnaireQuery['newStaffQuestionnaire']
> = {
  personNumber: '000123456',
  firstName: 'John',
  lastName: 'Doe',
  spousePersonNumber: '000789123',
  spouseFirstName: 'Jane',
  spouseJoining: false,
  maritalStatus: NewStaffQuestionnaireMaritalStatusEnum.Married,
  age: GoalCalculationAge.ThirtyToThirtyFour,
  spouseAge: GoalCalculationAge.UnderThirty,
  tenure: 4,
  spouseTenure: 2,
  address: '123 Main St, Apt 4, Miami, FL 33101',
  studentLoanMonthlyPayment: null,
  carLoanMonthlyPayment: null,
  creditCardDebtMonthlyPayment: null,
};

type MinistryMock = { name: string; children: { name: string }[] };

export const defaultMinistries: MinistryMock[] = [
  {
    name: 'Campus Ministry',
    children: [{ name: 'University' }, { name: 'High School' }],
  },
  {
    name: 'Other Ministries',
    children: [{ name: 'Jesus Film Project' }],
  },
  { name: 'Athletes in Action', children: [] },
];

export interface NsoMpdQuestionnaireTestWrapperProps {
  hasSpouse?: boolean;
  newStaffQuestionnaire?: DeepPartial<
    NewStaffQuestionnaireQuery['newStaffQuestionnaire']
  > | null;
  onCall?: MockLinkCallHandler;
  mockPush?: jest.Mock;
  /** Override the OneApp ministries list, e.g. `[]` to exercise the load-failure state. */
  ministries?: MinistryMock[];
  children?: React.ReactNode;
}

export const NsoMpdQuestionnaireTestWrapper: React.FC<
  NsoMpdQuestionnaireTestWrapperProps
> = ({
  hasSpouse = true,
  newStaffQuestionnaire,
  onCall,
  mockPush,
  ministries = defaultMinistries,
  children,
}) => {
  return (
    <ThemeProvider theme={theme}>
      <TestRouter router={mockPush ? { push: mockPush } : {}}>
        <GqlMockedProvider<{
          GetUser: GetUserQuery;
          GoalCalculatorConstants: GoalCalculatorConstantsQuery;
          NewStaffQuestionnaire: NewStaffQuestionnaireQuery;
          Ministries: MinistriesQuery;
        }>
          mocks={{
            GetUser: {
              user: { avatar: 'avatar.jpg', staffAccountId: '000123456' },
            },
            NewStaffQuestionnaire: {
              newStaffQuestionnaire:
                newStaffQuestionnaire === null
                  ? null
                  : merge(
                      {},
                      newStaffQuestionnaireMock,
                      newStaffQuestionnaire,
                      hasSpouse
                        ? undefined
                        : {
                            maritalStatus:
                              NewStaffQuestionnaireMaritalStatusEnum.Single,
                          },
                    ),
            },
            GoalCalculatorConstants: {
              constant: {
                mpdGoalGeographicConstants: [
                  { location: 'Atlanta, GA' },
                  { location: 'Miami, FL' },
                  { location: 'None' },
                ],
              },
            },
            Ministries: {
              ministries,
            },
          }}
          onCall={onCall}
        >
          <SnackbarProvider>
            <NsoMpdQuestionnaireProvider>
              {children}
            </NsoMpdQuestionnaireProvider>
          </SnackbarProvider>
        </GqlMockedProvider>
      </TestRouter>
    </ThemeProvider>
  );
};
