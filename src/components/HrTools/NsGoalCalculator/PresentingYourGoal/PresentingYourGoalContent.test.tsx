import React from 'react';
import { render } from '@testing-library/react';
import { beforeTestResizeObserver } from '__tests__/util/windowResizeObserver';
import {
  NsGoalCalculatorTestWrapper,
  defaultGoalCalculation,
} from '../NsGoalCalculatorTestWrapper';
import { PresentingYourGoalContent } from './PresentingYourGoalContent';

describe('PresentingYourGoalContent', () => {
  beforeEach(() => {
    beforeTestResizeObserver();
  });

  it('renders the presentation and footer', async () => {
    const { findByRole, getByText } = render(
      <NsGoalCalculatorTestWrapper>
        <PresentingYourGoalContent
          goalCalculation={defaultGoalCalculation}
          footer={<button type="button">Continue</button>}
        />
      </NsGoalCalculatorTestWrapper>,
    );

    expect(
      await findByRole('heading', { name: 'Presenting Your Goal' }),
    ).toBeInTheDocument();
    expect(getByText('Print Support Needs Presentation')).toBeInTheDocument();
    expect(getByText('Continue')).toBeInTheDocument();
  });

  it('renders when support raised is unknown (null)', async () => {
    const { findByRole } = render(
      <NsGoalCalculatorTestWrapper>
        <PresentingYourGoalContent
          goalCalculation={{
            ...defaultGoalCalculation,
            calculations: {
              ...defaultGoalCalculation.calculations,
              supportRaised: null,
            },
          }}
        />
      </NsGoalCalculatorTestWrapper>,
    );

    expect(
      await findByRole('heading', { name: 'Presenting Your Goal' }),
    ).toBeInTheDocument();
  });
});
