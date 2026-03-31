import React from 'react';
import { render } from '@testing-library/react';
import { PdsGoalCalculatorTestWrapper } from '../PdsGoalCalculatorTestWrapper';
import { SetupStep } from './SetupStep';

describe('SetupStep', () => {
  it('renders the setup step placeholder', () => {
    const { getAllByText } = render(
      <PdsGoalCalculatorTestWrapper>
        <SetupStep />
      </PdsGoalCalculatorTestWrapper>,
    );

    expect(getAllByText('Setup').length).toBeGreaterThan(0);
    expect(getAllByText('Settings').length).toBeGreaterThan(0);
  });
});
