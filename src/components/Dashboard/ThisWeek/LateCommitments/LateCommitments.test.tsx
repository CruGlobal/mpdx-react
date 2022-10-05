import React from 'react';
import { GqlMockedProvider } from '../../../../../__tests__/util/graphqlMocking';
import { render } from '../../../../../__tests__/util/testingLibraryReactMock';
import LateCommitments from './LateCommitments';

jest.mock('next/router', () => ({
  useRouter: () => {
    return {
      query: { accountListId: 'abc' },
      isReady: true,
    };
  },
}));

describe('LateCommitments', () => {
  it('default', () => {
    const { getByTestId, queryByTestId } = render(<LateCommitments />);
    expect(getByTestId('LateCommitmentsCardContentEmpty')).toBeInTheDocument();
    expect(queryByTestId('LateCommitmentsDivLoading')).not.toBeInTheDocument();
    expect(
      queryByTestId('LateCommitmentsListContacts'),
    ).not.toBeInTheDocument();
  });

  it('loading', () => {
    const { getByTestId, queryByTestId } = render(<LateCommitments loading />);
    expect(
      queryByTestId('LateCommitmentsCardContentEmpty'),
    ).not.toBeInTheDocument();
    expect(getByTestId('LateCommitmentsDivLoading')).toBeInTheDocument();
    expect(
      queryByTestId('LateCommitmentsListContacts'),
    ).not.toBeInTheDocument();
  });

  it('empty', () => {
    const latePledgeContacts = {
      nodes: [],
      totalCount: 0,
    };
    emptyCheck(latePledgeContacts);
  });

  it('should show empty if all of the late pledges are under 7 days late', () => {
    const latePledgeContacts = {
      nodes: [
        {
          id: 'contact1',
          name: 'Smith, Sarah',
          lateAt: '2019-12-31',
        },
        {
          id: 'contact2',
          name: 'Smith, John',
          lateAt: '2019-12-30',
        },
      ],
      totalCount: 2,
    };
    emptyCheck(latePledgeContacts);
  });

  const emptyCheck = (latePledgeContacts: any) => {
    const { getByTestId, queryByTestId } = render(
      <LateCommitments latePledgeContacts={latePledgeContacts} />,
    );
    expect(getByTestId('LateCommitmentsCardContentEmpty')).toBeInTheDocument();
    expect(queryByTestId('LateCommitmentsDivLoading')).not.toBeInTheDocument();
    expect(
      queryByTestId('LateCommitmentsListContacts'),
    ).not.toBeInTheDocument();
  };

  it('props', () => {
    const latePledgeContacts = {
      nodes: [
        {
          id: 'contact1',
          name: 'Smith, Sarah',
          lateAt: '2012-10-01',
        },
        {
          id: 'contact2',
          name: 'Smith, John',
          lateAt: '2015-12-01',
        },
      ],
      totalCount: 1595,
    };
    const { getByTestId, queryByTestId } = render(
      <GqlMockedProvider>
        <LateCommitments latePledgeContacts={latePledgeContacts} />
      </GqlMockedProvider>,
    );
    expect(
      queryByTestId('LateCommitmentsCardContentEmpty'),
    ).not.toBeInTheDocument();
    expect(queryByTestId('LateCommitmentsDivLoading')).not.toBeInTheDocument();
    const buttonElement = getByTestId('LateCommitmentsButtonViewAll');
    expect(buttonElement.textContent).toEqual('View All (1,595)');
    const contact1Element = getByTestId(
      'LateCommitmentsListItemContact-contact1',
    );
    expect(contact1Element.textContent).toEqual(
      'Smith, SarahTheir gift is 2,648 days late.',
    );
    const contact2Element = getByTestId(
      'LateCommitmentsListItemContact-contact2',
    );
    expect(contact2Element.textContent).toEqual(
      'Smith, JohnTheir gift is 1,492 days late.',
    );
  });

  it('should not show a late commitment that is less than 7 days late', () => {
    const latePledgeContacts = {
      nodes: [
        {
          id: 'contact1',
          name: 'Smith, Sarah',
          lateAt: '2019-12-31',
        },
        {
          id: 'contact2',
          name: 'Smith, John',
          lateAt: '2015-12-01',
        },
      ],
      totalCount: 2,
    };
    const { getByTestId, queryByTestId } = render(
      <GqlMockedProvider>
        <LateCommitments latePledgeContacts={latePledgeContacts} />
      </GqlMockedProvider>,
    );
    const contact1Element = queryByTestId(
      'LateCommitmentsListItemContact-contact1',
    );
    expect(contact1Element).not.toBeInTheDocument();

    const contact2Element = getByTestId(
      'LateCommitmentsListItemContact-contact2',
    );
    expect(contact2Element.textContent).toEqual(
      'Smith, JohnTheir gift is 1,492 days late.',
    );
  });

  it('should not show a late commitment if it has no lateAt property', () => {
    const latePledgeContacts = {
      nodes: [
        {
          id: 'contact1',
          name: 'Smith, Sarah',
          lateAt: '2012-10-01',
        },
        {
          id: 'contact2',
          name: 'Smith, John',
        },
      ],
      totalCount: 2,
    };
    const { getByTestId, queryByTestId } = render(
      <GqlMockedProvider>
        <LateCommitments latePledgeContacts={latePledgeContacts} />
      </GqlMockedProvider>,
    );
    const contact1Element = getByTestId(
      'LateCommitmentsListItemContact-contact1',
    );
    expect(contact1Element.textContent).toEqual(
      'Smith, SarahTheir gift is 2,648 days late.',
    );

    const contact2Element = queryByTestId(
      'LateCommitmentsListItemContact-contact2',
    );
    expect(contact2Element).not.toBeInTheDocument();
  });
});
