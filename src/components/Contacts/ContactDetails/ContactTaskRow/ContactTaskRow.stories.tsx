import React, { ReactElement } from 'react';
import { ResultEnum } from '../../../../../graphql/types.generated';
import { gqlMock } from '../../../../../__tests__/util/graphqlMocking';
import { ContactRowFragmentDoc } from '../../ContactRow.generated';
import { ContactTaskRow } from './ContactTaskRow';
import { ContactTaskRowFragment } from './ContactTaskRow.generated';

export default {
  title: 'Contacts/Tab/ContactTasksTab/Row',
  component: ContactTaskRow,
};

export const Default = (): ReactElement => {
  const task = gqlMock<ContactTaskRowFragment>(ContactRowFragmentDoc, {
    mocks: {
      result: ResultEnum.None,
    },
  });

  return <ContactTaskRow task={task} />;
};

export const Complete = (): ReactElement => {
  const task = gqlMock<ContactTaskRowFragment>(ContactRowFragmentDoc, {
    mocks: {
      mocks: {
        result: ResultEnum.Completed,
      },
    },
  });

  return <ContactTaskRow task={task} />;
};

export const Late = (): ReactElement => {
  const task = gqlMock<ContactTaskRowFragment>(ContactRowFragmentDoc, {
    mocks: {
      mocks: {
        result: ResultEnum.None,
      },
    },
  });

  return <ContactTaskRow task={task} />;
};
