import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CollapsibleList } from './CollapsibleList';

describe('CollapsibleList', () => {
  it('renders the primary items', () => {
    const { getByText } = render(<CollapsibleList primaryItem="Primary" />);

    expect(getByText('Primary')).toBeInTheDocument();
  });

  it('hides the toggle if there are no secondary items', () => {
    const { queryByTestId } = render(<CollapsibleList primaryItem="Primary" />);

    expect(queryByTestId('ExpandMoreIcon')).not.toBeInTheDocument();
  });

  it('initially hides the secondary items', () => {
    const { queryByText } = render(
      <CollapsibleList primaryItem="Primary" secondaryItems="Secondary" />,
    );

    expect(queryByText('Secondary')).not.toBeInTheDocument();
  });

  it('toggles the secondary items visible', () => {
    const { getByTestId, getByText, queryByText } = render(
      <CollapsibleList primaryItem="Primary" secondaryItems="Secondary" />,
    );

    userEvent.click(getByTestId('ExpandMoreIcon'));
    expect(getByText('Secondary')).toBeInTheDocument();

    userEvent.click(getByTestId('ExpandLessIcon'));
    expect(queryByText('Secondary')).not.toBeInTheDocument();
  });
});
