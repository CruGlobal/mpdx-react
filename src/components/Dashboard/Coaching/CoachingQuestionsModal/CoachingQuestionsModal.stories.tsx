import { MuiThemeProvider } from '@material-ui/core';
import React, { ReactElement } from 'react';
import { GqlMockedProvider } from '../../../../../__tests__/util/graphqlMocking';
import theme from '../../../../theme';
import {
  GetCoachingAnswerSetsDocument,
  GetCoachingAnswerSetsQuery,
} from '../GetCoachingAnswerSets.generated';
import CoachingQuestionsModal from './CoachingQuestionsModal';

export default {
  title: 'Coaching/CoachingQuestionsModal',
};

const accountListId = 'abc';

export const Null = (): ReactElement => {
  const mock = {
    GetCoachingAnswerSets: {
      coachingAnswerSets: [{ id: '1', questions: [] }],
    },
  };

  return (
    <GqlMockedProvider<GetCoachingAnswerSetsQuery> mocks={mock}>
      <MuiThemeProvider theme={theme}>
        <CoachingQuestionsModal
          accountListId={accountListId}
          isOpen={true}
          closeDrawer={() => {}}
        />
      </MuiThemeProvider>
    </GqlMockedProvider>
  );
};

export const ShortAnswer = (): ReactElement => {
  const mock = {
    GetCoachingAnswerSets: {
      coachingAnswerSets: [{ questions: [{ responseOptions: null }] }],
    },
  };

  return (
    <GqlMockedProvider<GetCoachingAnswerSetsQuery> mocks={mock}>
      <CoachingQuestionsModal
        accountListId={accountListId}
        isOpen={true}
        closeDrawer={() => {}}
      />
    </GqlMockedProvider>
  );
};

export const ResponseOptions = (): ReactElement => {
  const mock = {
    GetCoachingAnswerSets: {
      coachingAnswerSets: [
        { questions: [{ responseOptions: ['option 1', 'option 2'] }] },
      ],
    },
  };

  return (
    <GqlMockedProvider<GetCoachingAnswerSetsQuery> mocks={mock}>
      <CoachingQuestionsModal
        accountListId={accountListId}
        isOpen={true}
        closeDrawer={() => {}}
      />
    </GqlMockedProvider>
  );
};
