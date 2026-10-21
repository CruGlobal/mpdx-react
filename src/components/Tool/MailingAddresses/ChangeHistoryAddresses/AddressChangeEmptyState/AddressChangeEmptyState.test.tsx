import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import theme from 'src/theme';
import { AddressChangeEmptyState } from './AddressChangeEmptyState';

describe('AddressChangeEmptyState', () => {
  it.each([
    [
      'none',
      'No address changes available yet',
      'Address changes for your partners will appear here.',
    ],
    [
      'defaultRange',
      'No address changes in the last 12 months',
      'Choose "Any time" under Changed during to see older changes.',
    ],
    [
      'other',
      'No address changes match your filters',
      'Try changing your filters.',
    ],
  ] as const)(
    'shows the right message when the filter is %s',
    (filter, title, text) => {
      const { getByTestId } = render(
        <ThemeProvider theme={theme}>
          <AddressChangeEmptyState filter={filter} />
        </ThemeProvider>,
      );

      expect(getByTestId('address-changes-null-state')).toHaveTextContent(
        title + text,
      );
      // Announced to screen readers when it replaces the spinner
      expect(getByTestId('address-changes-null-state')).toHaveAttribute(
        'role',
        'status',
      );
    },
  );
});
