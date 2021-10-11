import React from 'react';
import { render, within } from '@testing-library/react';
import {
  gqlMock,
  GqlMockedProvider,
} from '../../../../__tests__/util/graphqlMocking';
import { ContactRow } from './ContactRow';
import {
  ContactRowFragment,
  ContactRowFragmentDoc,
} from './ContactRow.generated';

const accountListId = 'abc';
const onContactCheckToggle = jest.fn();

it('should display contact name', () => {
  const name = 'Name';
  const contact = gqlMock<ContactRowFragment>(ContactRowFragmentDoc, {
    mocks: { name },
  });
  const { getByTestId } = render(
    <GqlMockedProvider>
      <ContactRow
        accountListId={accountListId}
        contact={contact}
        isChecked={false}
        isContactDetailOpen={false}
        onContactCheckToggle={onContactCheckToggle}
        onContactSelected={() => {}}
      />
    </GqlMockedProvider>,
  );
  expect(within(getByTestId('ContactRow')).getByText(name)).toBeVisible();
});
