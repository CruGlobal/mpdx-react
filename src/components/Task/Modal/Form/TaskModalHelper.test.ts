import { loadConstantsMockData } from 'src/components/Constants/LoadConstantsMock';
import { PhaseEnum } from 'src/graphql/types.generated';
import { extractSuggestedTags } from './TaskModalHelper';

const phaseTags: string[] = loadConstantsMockData?.constant?.phases
  ?.find((phase) => phase?.id === PhaseEnum.Appointment)
  ?.results?.tags?.map((tag) => tag?.value as string) || [''];

const sampleSelectedSuggestedTags = [
  'asked for connections',
  'asked for support',
];
const otherTags = ['test', '2023'];
const allTags = [...otherTags, ...sampleSelectedSuggestedTags];

describe('extractSuggestedTags', () => {
  it('correctly splits suggested tags from tag list', async () => {
    expect(extractSuggestedTags(allTags, phaseTags).additionalTags).toEqual(
      otherTags,
    );
    expect(extractSuggestedTags(allTags, phaseTags).suggestedTags).toEqual(
      sampleSelectedSuggestedTags,
    );
  });
});
