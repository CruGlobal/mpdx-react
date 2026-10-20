import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import theme from 'src/theme';
import { AddressChangeEmptyState } from './AddressChangeEmptyState';

describe('AddressChangeEmptyState', () => {
  it.each([
    [
      false,
      'No address changes available yet',
      'Address changes for your partners will appear here.',
    ],
    [
      true,
      'No address changes match your filters',
      'Try changing your filters.',
    ],
  ])('shows the right message when filtered is %s', (filtered, title, text) => {
    const { getByTestId } = render(
      <ThemeProvider theme={theme}>
        <AddressChangeEmptyState filtered={filtered} />
      </ThemeProvider>,
    );

    expect(getByTestId('address-changes-null-state')).toHaveTextContent(
      title + text,
    );
  });
});
