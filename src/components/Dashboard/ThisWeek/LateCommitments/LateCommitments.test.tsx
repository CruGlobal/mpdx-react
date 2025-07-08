import React from 'react';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { render } from '__tests__/util/testingLibraryReactMock';
import LateCommitments, { LateCommitmentsProps } from './LateCommitments';

const TestComponent: React.FC<LateCommitmentsProps> = (props) => (
  <TestRouter>
    <GqlMockedProvider>
      <LateCommitments {...props} />
    </GqlMockedProvider>
  </TestRouter>
);

describe('LateCommitments', () => {
  it('default', () => {
    const { getByTestId, queryByTestId } = render(<TestComponent />);
    expect(getByTestId('LateCommitmentsCardContentEmpty')).toBeInTheDocument();
    expect(queryByTestId('LateCommitmentsDivLoading')).not.toBeInTheDocument();
    expect(
      queryByTestId('LateCommitmentsListContacts'),
    ).not.toBeInTheDocument();
  });

  it('loading', () => {
    const { getByTestId, queryByTestId } = render(<TestComponent loading />);
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
    const { getByTestId, queryByTestId } = render(
      <TestComponent latePledgeContacts={latePledgeContacts} />,
    );
    expect(getByTestId('LateCommitmentsCardContentEmpty')).toBeInTheDocument();
    expect(queryByTestId('LateCommitmentsDivLoading')).not.toBeInTheDocument();
    expect(
      queryByTestId('LateCommitmentsListContacts'),
    ).not.toBeInTheDocument();
  });

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
      <TestComponent latePledgeContacts={latePledgeContacts} />,
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
      <TestComponent latePledgeContacts={latePledgeContacts} />,
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
