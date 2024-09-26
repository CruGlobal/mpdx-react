import React from 'react';
import { ThemeProvider } from '@emotion/react';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestWrapper from '__tests__/util/TestWrapper';
import { loadConstantsMockData } from 'src/components/Constants/LoadConstantsMock';
import { PhaseEnum } from 'src/graphql/types.generated';
import theme from 'src/theme';
import { PhaseTags } from './PhaseTags';

const setSelectedSuggestedTags = jest.fn();

type ComponentsProps = {
  selectedSuggestedTags: string[];
};

const phaseTags: string[] = loadConstantsMockData?.constant?.phases
  ?.find((phase) => phase?.id === PhaseEnum.Appointment)
  ?.results?.tags?.map((tag) => tag?.value as string) || [''];

const Components = ({ selectedSuggestedTags }: ComponentsProps) => (
  <ThemeProvider theme={theme}>
    <TestWrapper>
      <PhaseTags
        tags={phaseTags}
        selectedTags={selectedSuggestedTags}
        setSelectedTags={setSelectedSuggestedTags}
      />
    </TestWrapper>
  </ThemeProvider>
);

describe('PhaseTags', () => {
  it('renders the Phase Tags', async () => {
    const { getByText } = render(<Components selectedSuggestedTags={[]} />);
    userEvent.click(getByText(phaseTags[0]));
    await waitFor(() =>
      expect(setSelectedSuggestedTags).toHaveBeenCalledWith([phaseTags[0]]),
    );
  });
});
