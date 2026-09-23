import React from 'react';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MockLinkCallHandler } from 'graphql-ergonomock/dist/apollo/MockLink';
import { NsoMpdQuestionnaireTestWrapper } from '../NsoMpdQuestionnaireTestWrapper';
import { NsoDetails } from './NsoDetails';

const mutationSpy = jest.fn();

const TestComponent: React.FC<{ onCall?: MockLinkCallHandler }> = ({
  onCall,
}) => (
  <NsoMpdQuestionnaireTestWrapper onCall={onCall}>
    <NsoDetails />
  </NsoMpdQuestionnaireTestWrapper>
);

describe('NsoDetails', () => {
  it('renders the housing question with all options', () => {
    const { getByRole } = render(<TestComponent />);

    expect(
      getByRole('radiogroup', {
        name: 'Which of the following describes your NSO housing?',
      }),
    ).toBeInTheDocument();
    expect(
      getByRole('radio', { name: 'Single in hotel/dorm room' }),
    ).toBeInTheDocument();
    expect(
      getByRole('radio', { name: 'Sharing 2 in hotel/suite dorm room' }),
    ).toBeInTheDocument();
    expect(
      getByRole('radio', { name: 'Married couple in hotel/suite dorm room' }),
    ).toBeInTheDocument();
    expect(
      getByRole('radio', { name: 'Family in hotel/suite dorm room' }),
    ).toBeInTheDocument();
    expect(
      getByRole('radio', { name: 'Virtual / Local / Commuting' }),
    ).toBeInTheDocument();
  });

  it.each([
    ['Single in hotel/dorm room', 'You have no roommate and no suitemates.'],
    [
      'Sharing 2 in hotel/suite dorm room',
      'You have a roommate, or your own bedroom in a shared suite.',
    ],
    [
      'Married couple in hotel/suite dorm room',
      "You're staying together as a couple or family.",
    ],
    [
      'Family in hotel/suite dorm room',
      "You're staying together as a couple or family.",
    ],
    [
      'Virtual / Local / Commuting',
      "You're attending virtually or commuting daily and not using NSO housing.",
    ],
  ])(
    'explains the "%s" housing option under its label',
    (label, description) => {
      const { getByRole } = render(<TestComponent />);

      const descriptionId = getByRole('radio', { name: label }).getAttribute(
        'aria-describedby',
      );
      expect(document.getElementById(descriptionId ?? '')).toHaveTextContent(
        description,
      );
    },
  );

  it('saves the housing enum constant', async () => {
    const { getByRole } = render(<TestComponent onCall={mutationSpy} />);

    userEvent.click(
      getByRole('radio', { name: 'Family in hotel/suite dorm room' }),
    );

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation(
        'UpdateNewStaffQuestionnaire',
        {
          input: {
            accountListId: 'account-list-1',
            attributes: { nsoHousing: 'FAMILY_ROOM' },
          },
        },
      ),
    );
  });

  it('saves the childcare count as a number', async () => {
    const { getByRole } = render(<TestComponent onCall={mutationSpy} />);

    userEvent.type(
      getByRole('spinbutton', {
        name: 'If you are a parent with children in Childcare, please enter how many.',
      }),
      '3',
    );
    userEvent.tab();

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation(
        'UpdateNewStaffQuestionnaire',
        {
          input: {
            accountListId: 'account-list-1',
            attributes: { childcareChildrenCount: 3 },
          },
        },
      ),
    );
  });

  it('renders the sessions question with both options', () => {
    const { getByRole } = render(<TestComponent />);

    expect(
      getByRole('radiogroup', {
        name: 'Which describes the sessions you are attending?',
      }),
    ).toBeInTheDocument();
    expect(getByRole('radio', { name: 'IBS and NSO' })).toBeInTheDocument();
    expect(getByRole('radio', { name: 'NSO' })).toBeInTheDocument();
  });

  it('renders the special needs support and childcare fields', () => {
    const { getByRole } = render(<TestComponent />);

    expect(
      getByRole('spinbutton', {
        name: 'How much special needs support have you already received for NSO?',
      }),
    ).toBeInTheDocument();
    expect(
      getByRole('spinbutton', {
        name: 'If you are a parent with children in Childcare, please enter how many.',
      }),
    ).toBeInTheDocument();
  });

  it('shows the required error on a numeric field once it is touched', () => {
    const { getByRole, getByText } = render(<TestComponent />);

    getByRole('spinbutton', {
      name: 'How much special needs support have you already received for NSO?',
    }).focus();
    userEvent.tab();

    expect(
      getByText('Please enter an amount, or 0 if you have none.'),
    ).toBeInTheDocument();
  });

  it('accepts 0 in the numeric fields', () => {
    const { getByRole, queryByText } = render(<TestComponent />);

    userEvent.type(
      getByRole('spinbutton', {
        name: 'How much special needs support have you already received for NSO?',
      }),
      '0',
    );
    userEvent.type(
      getByRole('spinbutton', {
        name: 'If you are a parent with children in Childcare, please enter how many.',
      }),
      '0',
    );

    expect(
      queryByText('Please enter an amount, or 0 if you have none.'),
    ).not.toBeInTheDocument();
    expect(
      queryByText('Please enter a number, or 0 if you have none.'),
    ).not.toBeInTheDocument();
  });

  it('shows a currency adornment on the special needs support amount', () => {
    const { getByText } = render(<TestComponent />);

    expect(getByText('$')).toBeInTheDocument();
  });
});
