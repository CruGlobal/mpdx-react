import { render } from '@testing-library/react';
import { StaticBanner } from './StaticBanner';

test('static banner displays', () => {
  const { queryByTestId } = render(<StaticBanner />);

  expect(queryByTestId('staticBanner')).toBeInTheDocument();
});
