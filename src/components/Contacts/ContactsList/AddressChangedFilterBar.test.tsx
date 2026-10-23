import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestRouter from '__tests__/util/TestRouter';
import { removeTagsFromFilters } from 'pages/accountLists/[accountListId]/tasks/sanitizeFilters';
import { UrlFiltersProvider } from 'src/components/Shared/UrlFiltersProvider/UrlFiltersProvider';
import {
  ContactFilterSetInput,
  ContactFilterStatusEnum,
} from 'src/graphql/types.generated';
import { AddressChangedFilterBar } from './AddressChangedFilterBar';

const replace = jest.fn();

const TestComponent: React.FC<{ filters: ContactFilterSetInput }> = ({
  filters,
}) => (
  <TestRouter
    router={{
      query: {
        accountListId: 'account-list-1',
        filters: encodeURIComponent(JSON.stringify(filters)),
      },
      replace,
      isReady: true,
    }}
  >
    <UrlFiltersProvider sanitizeFilters={removeTagsFromFilters}>
      <AddressChangedFilterBar />
    </UrlFiltersProvider>
  </TestRouter>
);

describe('AddressChangedFilterBar', () => {
  it('describes the address changed filter', () => {
    const { getByText } = render(
      <TestComponent
        filters={{ addressChanged: { min: '2026-01-01', max: '2026-02-01' } }}
      />,
    );

    expect(
      getByText('Address changed between Jan 1, 2026 and Feb 1, 2026'),
    ).toBeInTheDocument();
  });

  it('bolds the filters but not the words between them', () => {
    const { container } = render(
      <TestComponent
        filters={{
          addressChanged: { min: '2026-01-01' },
          addressChangedIncludeAutomatic: false,
        }}
      />,
    );

    expect(container).toHaveTextContent(
      'Filtered by Address changed since Jan 1, 2026 and excluding automatic updates',
    );
    expect(
      Array.from(container.querySelectorAll('strong')).map(
        (bold) => bold.textContent,
      ),
    ).toEqual([
      'Address changed since Jan 1, 2026',
      'excluding automatic updates',
    ]);
  });

  it('clears only the address changed filters', () => {
    const { getByRole } = render(
      <TestComponent
        filters={{
          status: [ContactFilterStatusEnum.PartnerFinancial],
          addressChanged: { min: '2026-01-01' },
          addressChangedIncludeAutomatic: false,
        }}
      />,
    );

    userEvent.click(getByRole('button', { name: 'Clear' }));

    expect(
      JSON.parse(decodeURIComponent(replace.mock.lastCall[0].query.filters)),
    ).toEqual({ status: [ContactFilterStatusEnum.PartnerFinancial] });
  });

  it('shows nothing without the address changed filter', () => {
    const { container } = render(<TestComponent filters={{}} />);

    expect(container).toBeEmptyDOMElement();
  });
});
