import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NsoMpdQuestionnaireTestWrapper } from '../NsoMpdQuestionnaireTestWrapper';
import { NsoInformation } from './NsoInformation';

const TestComponent: React.FC = () => (
  <NsoMpdQuestionnaireTestWrapper>
    <NsoInformation />
  </NsoMpdQuestionnaireTestWrapper>
);

describe('NsoInformation', () => {
  it('renders the heading and intro', () => {
    const { getByRole } = render(<TestComponent />);

    expect(
      getByRole('heading', { name: 'NSO Information' }),
    ).toBeInTheDocument();
  });

  it('keeps Continue disabled until all four questions are answered', () => {
    const { getByRole } = render(<TestComponent />);

    const continueButton = getByRole('button', { name: 'Continue' });
    expect(continueButton).toBeDisabled();

    userEvent.click(getByRole('radio', { name: 'Single in hotel/dorm room' }));
    expect(continueButton).toBeDisabled();

    userEvent.click(getByRole('radio', { name: 'NSO' }));
    expect(continueButton).toBeDisabled();

    userEvent.type(
      getByRole('spinbutton', {
        name: 'How much special needs support have you already received for NSO?',
      }),
      '500',
    );
    expect(continueButton).toBeDisabled();

    userEvent.type(
      getByRole('spinbutton', {
        name: 'If you are a parent with children in Childcare, please enter how many.',
      }),
      '0',
    );
    expect(continueButton).toBeEnabled();
  });
});
