import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LikelyToGiveEnum } from 'src/graphql/types.generated';
import { LikelyToGiveSelect } from './LikelyToGiveSelect';

describe('LikelyToGiveSelect', () => {
  it('should render a Select with all LikelyToGiveEnum options', async () => {
    const { getByRole, getByText } = render(
      <LikelyToGiveSelect value="" onChange={() => {}} />,
    );
    await userEvent.click(getByRole('combobox'));
    expect(getByText('Least Likely')).toBeInTheDocument();
  });

  it('should pass props to Select and show selected value', () => {
    const { getByTestId, getByText } = render(
      <LikelyToGiveSelect
        value={LikelyToGiveEnum.LeastLikely}
        onChange={jest.fn()}
        data-testid="likely-to-give-select"
      />,
    );
    expect(getByTestId('likely-to-give-select')).toBeInTheDocument();
    expect(getByText('Least Likely')).toBeInTheDocument();
  });
});
