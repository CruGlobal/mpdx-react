import React from 'react';
import { render } from '@testing-library/react';
import { blockImpersonatingNonDevelopers } from 'pages/api/utils/pagePropsHelpers';
import { PdsGoalCalculatorTestWrapper } from 'src/components/Reports/PdsGoalCalculator/PdsGoalCalculatorTestWrapper';
import { PdsGoalCalculatorPage, getServerSideProps } from './[pdsGoalId].page';

describe('[pdsGoalId] page', () => {
  it('uses blockImpersonatingNonDevelopers for server-side props', () => {
    expect(getServerSideProps).toBe(blockImpersonatingNonDevelopers);
  });

  it('renders Saving indicator', async () => {
    const { findByText } = render(
      <PdsGoalCalculatorTestWrapper withProvider={false}>
        <PdsGoalCalculatorPage />
      </PdsGoalCalculatorTestWrapper>,
    );

    expect(await findByText(/Last saved/)).toBeInTheDocument();
  });
});
