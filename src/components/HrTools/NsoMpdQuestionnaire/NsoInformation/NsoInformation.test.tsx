import React from 'react';
import { render } from '@testing-library/react';
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

  it('keeps Continue enabled even before the questions are answered', () => {
    const { getByRole } = render(<TestComponent />);

    expect(getByRole('button', { name: 'Continue' })).toBeEnabled();
  });
});
