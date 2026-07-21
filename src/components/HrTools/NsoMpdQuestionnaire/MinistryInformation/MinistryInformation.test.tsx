import React from 'react';
import { render } from '@testing-library/react';
import { NsoMpdQuestionnaireTestWrapper } from '../NsoMpdQuestionnaireTestWrapper';
import { MinistryInformation } from './MinistryInformation';

const TestComponent: React.FC = () => (
  <NsoMpdQuestionnaireTestWrapper>
    <MinistryInformation />
  </NsoMpdQuestionnaireTestWrapper>
);

describe('MinistryInformation', () => {
  it('keeps Continue enabled even before the fields are answered', () => {
    const { getByRole } = render(<TestComponent />);

    // Gating moved to the Summary step, so Continue is never disabled here.
    expect(getByRole('button', { name: 'Continue' })).toBeEnabled();
  });
});
