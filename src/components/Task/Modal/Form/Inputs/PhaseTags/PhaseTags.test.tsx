import React from 'react';
import { ThemeProvider } from '@emotion/react';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestWrapper from '__tests__/util/TestWrapper';
import { loadConstantsMockData } from 'src/components/Constants/LoadConstantsMock';
import { PhaseEnum } from 'src/graphql/types.generated';
import theme from 'src/theme';
import { filterTags } from '../../TaskModalHelper';
import { PhaseTags } from './PhaseTags';

const setSelectedSuggestedTags = jest.fn();

type ComponentsProps = {
  selectedSuggestedTags: string[];
};

const phaseTags: string[] = loadConstantsMockData?.constant?.phases
  ?.find((phase) => phase?.id === PhaseEnum.Appointment)
  ?.results?.tags?.map((tag) => tag?.value as string) || [''];

const sampleSelectedSuggestedTags = [
  'asked for connections',
  'asked for support',
];
const otherTags = ['test', '2023'];
const allTags = [...otherTags, ...sampleSelectedSuggestedTags];

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
    expect(getByText(phaseTags[0])).toBeInTheDocument();
    userEvent.click(getByText(phaseTags[0]));
    await waitFor(() =>
      expect(setSelectedSuggestedTags).toHaveBeenCalledWith([phaseTags[0]]),
    );
  });

  it('correctly splits suggested tags from tag list', async () => {
    expect(filterTags(allTags, phaseTags).additionalTags).toEqual(otherTags);
    expect(filterTags(allTags, phaseTags).suggestedTags).toEqual(
      sampleSelectedSuggestedTags,
    );
  });
});
