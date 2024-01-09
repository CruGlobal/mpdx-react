import { render } from '@testing-library/react';
import { IncompleteWarning } from './IncompleteWarning';

describe('IncompleteWarning', () => {
  it('hides with under 1000 ids', () => {
    const { queryByTestId } = render(
      <IncompleteWarning selectedIdCount={100} idCount={100} />,
    );

    expect(queryByTestId('WarningIcon')).not.toBeInTheDocument();
  });

  it('hides with over 1000 ids', () => {
    const { queryByTestId } = render(
      <IncompleteWarning selectedIdCount={2000} idCount={1000} />,
    );

    expect(queryByTestId('WarningIcon')).toBeInTheDocument();
  });
});
