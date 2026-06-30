import React from 'react';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MockLinkCallHandler } from 'graphql-ergonomock/dist/apollo/MockLink';
import { NsoMpdQuestionnaireTestWrapper } from '../NsoMpdQuestionnaireTestWrapper';
import { MinistryDetails } from './MinistryDetails';

const TestComponent: React.FC<{ onCall?: MockLinkCallHandler }> = ({
  onCall,
}) => (
  <NsoMpdQuestionnaireTestWrapper onCall={onCall}>
    <MinistryDetails />
  </NsoMpdQuestionnaireTestWrapper>
);

describe('MinistryDetails', () => {
  it('renders the four questions', async () => {
    const { getByRole, findByRole } = render(<TestComponent />);

    expect(
      getByRole('combobox', {
        name: 'What ministry are you expecting to serve with?',
      }),
    ).toBeInTheDocument();
    expect(
      getByRole('textbox', {
        name: 'What is your expected ministry assignment location?',
      }),
    ).toBeInTheDocument();
    expect(
      await findByRole('combobox', {
        name: 'Is your ministry assignment location within 50 miles of one of these cities?',
      }),
    ).toBeInTheDocument();
    expect(
      getByRole('radiogroup', {
        name: 'What type of assignment are you expecting?',
      }),
    ).toBeInTheDocument();
  });

  it('marks the location field as required', () => {
    const { getByRole } = render(<TestComponent />);

    expect(
      getByRole('textbox', {
        name: 'What is your expected ministry assignment location?',
      }),
    ).toBeRequired();
  });

  it('offers the dummy ministry options', () => {
    const { getByRole } = render(<TestComponent />);

    userEvent.click(
      getByRole('combobox', {
        name: 'What ministry are you expecting to serve with?',
      }),
    );

    expect(getByRole('option', { name: 'Cru' })).toBeInTheDocument();
    expect(
      getByRole('option', { name: 'Athletes in Action' }),
    ).toBeInTheDocument();
  });

  it('populates the nearest-city options from the geographic constants', async () => {
    const { getByRole, findByRole } = render(<TestComponent />);

    const cityCombobox = await findByRole('combobox', {
      name: 'Is your ministry assignment location within 50 miles of one of these cities?',
    });
    await waitFor(() =>
      expect(cityCombobox).not.toHaveAttribute('aria-disabled', 'true'),
    );
    userEvent.click(cityCombobox);

    expect(
      await findByRole('option', { name: 'Atlanta, GA' }),
    ).toBeInTheDocument();
    expect(getByRole('option', { name: 'Miami, FL' })).toBeInTheDocument();
  });

  it('offers Field and Office assignment types', () => {
    const { getByRole } = render(<TestComponent />);

    expect(getByRole('radio', { name: 'Field' })).toBeInTheDocument();
    expect(getByRole('radio', { name: 'Office' })).toBeInTheDocument();
  });

  it('saves FIELD when the field assignment is chosen', async () => {
    const mutationSpy = jest.fn();
    const { getByRole } = render(<TestComponent onCall={mutationSpy} />);

    userEvent.click(getByRole('radio', { name: 'Field' }));

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation(
        'UpdateNewStaffQuestionnaire',
        {
          input: {
            accountListId: 'account-list-1',
            attributes: { assignmentType: 'FIELD' },
          },
        },
      ),
    );
  });

  it('shows a loading indicator in place of the city field until the constants load', () => {
    const { getByRole, queryByRole } = render(<TestComponent />);

    expect(getByRole('progressbar')).toBeInTheDocument();
    expect(
      queryByRole('combobox', {
        name: 'Is your ministry assignment location within 50 miles of one of these cities?',
      }),
    ).not.toBeInTheDocument();
  });
});
