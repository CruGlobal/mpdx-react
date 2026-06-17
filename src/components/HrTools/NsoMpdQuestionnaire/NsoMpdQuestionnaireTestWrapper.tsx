import { ThemeProvider } from '@mui/material/styles';
import { MockLinkCallHandler } from 'graphql-ergonomock/dist/apollo/MockLink';
import { merge } from 'lodash';
import { SnackbarProvider } from 'notistack';
import { DeepPartial } from 'ts-essentials';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider, gqlMock } from '__tests__/util/graphqlMocking';
import { GetUserQuery } from 'src/components/User/GetUser.generated';
import { AssignmentStatusEnum } from 'src/graphql/types.generated';
import { GoalCalculatorConstantsQuery } from 'src/hooks/goalCalculatorConstants.generated';
import theme from 'src/theme';
import {
  HcmDocument,
  HcmQuery,
  HcmQueryVariables,
} from '../Shared/HcmData/Hcm.generated';
import { NsoMpdQuestionnaireProvider } from './Shared/NsoMpdQuestionnaireContext';

const hcmMock = gqlMock<HcmQuery, HcmQueryVariables>(HcmDocument, {
  mocks: {
    hcm: [
      {
        staffInfo: {
          preferredName: 'John',
          lastName: 'Doe',
          age: 34,
          tenure: 4,
          assignmentStatus: AssignmentStatusEnum.ActivePayrollEligible,
          addressLine1: '123 Main St',
          addressLine2: 'Apt 4',
          city: 'Miami',
          state: 'FL',
          zipCode: '33101',
        },
      },
      {
        staffInfo: {
          preferredName: 'Jane',
          lastName: 'Doe',
          age: 32,
          tenure: 2,
          assignmentStatus: AssignmentStatusEnum.ActivePaidLeave,
          addressLine1: '456 Oak Ave',
          addressLine2: '',
          city: 'Tampa',
          state: 'FL',
          zipCode: '33601',
        },
      },
    ],
  },
}).hcm;

export const hcmUserMock = hcmMock[0];
export const hcmSpouseMock = hcmMock[1];

export interface NsoMpdQuestionnaireTestWrapperProps {
  hcmUser?: DeepPartial<HcmQuery['hcm'][number]>;
  hcmSpouse?: DeepPartial<HcmQuery['hcm'][number]>;
  hasSpouse?: boolean;
  onCall?: MockLinkCallHandler;
  children?: React.ReactNode;
}

export const NsoMpdQuestionnaireTestWrapper: React.FC<
  NsoMpdQuestionnaireTestWrapperProps
> = ({ hcmUser, hcmSpouse, hasSpouse = true, onCall, children }) => {
  const hcmUserMerged = merge({}, hcmUserMock, hcmUser);
  const hcmSpouseMerged = merge({}, hcmSpouseMock, hcmSpouse);
  return (
    <ThemeProvider theme={theme}>
      <TestRouter>
        <GqlMockedProvider<{
          Hcm: HcmQuery;
          GetUser: GetUserQuery;
          GoalCalculatorConstants: GoalCalculatorConstantsQuery;
        }>
          mocks={{
            GetUser: {
              user: { avatar: 'avatar.jpg', staffAccountId: '000123456' },
            },
            Hcm: {
              hcm: hasSpouse
                ? [hcmUserMerged, hcmSpouseMerged]
                : [hcmUserMerged],
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
