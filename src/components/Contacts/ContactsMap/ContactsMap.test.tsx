import { render, waitForElementToBeRemoved } from '@testing-library/react';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { ContactsProvider } from '../ContactsContext/ContactsContext';
import { ContactsMap } from './ContactsMap';

describe('ContactsMap', () => {
  it('renders loading spinner until map loads', () => {
    const { getByRole } = render(
      <TestRouter>
        <GqlMockedProvider>
          <ContactsProvider
            urlFilters={{}}
            activeFilters={{}}
            setActiveFilters={jest.fn()}
            starredFilter={{}}
            setStarredFilter={jest.fn()}
            filterPanelOpen={false}
            setFilterPanelOpen={jest.fn()}
            contactId={undefined}
            searchTerm={''}
          >
            <ContactsMap />
          </ContactsProvider>
        </GqlMockedProvider>
      </TestRouter>,
    );

    const loadingSpinner = getByRole('progressbar');
    expect(loadingSpinner).toBeInTheDocument();
    waitForElementToBeRemoved(loadingSpinner);
  });
});
