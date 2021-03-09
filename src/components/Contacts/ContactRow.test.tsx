import React from 'react';
import { render } from '@testing-library/react';
import { gqlMock } from '../../../__tests__/util/graphqlMocking';
import { ContactRow } from './ContactRow';
import {
  ContactRowFragment,
  ContactRowFragmentDoc,
} from './ContactRow.generated';

it('should display contact name', () => {
  const name = 'Name';
  const contact = gqlMock<ContactRowFragment>(ContactRowFragmentDoc, {
    mocks: { name },
  });
  const { getByRole } = render(<ContactRow contact={contact} />);
  expect(getByRole('row').textContent).toEqual(name);
});
