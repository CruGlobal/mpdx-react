import { render, waitForElementToBeRemoved } from '@testing-library/react';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { TableViewModeEnum } from 'src/components/Shared/Header/ListHeader';
import { UrlFiltersProvider } from 'src/components/common/UrlFiltersProvider/UrlFiltersProvider';
import { ContactsProvider } from '../ContactsContext/ContactsContext';
import { ContactsMap } from './ContactsMap';

describe('ContactsMap', () => {
  it('renders loading spinner until map loads', () => {
    const { getByRole } = render(
      <TestRouter>
        <GqlMockedProvider>
          <UrlFiltersProvider>
            <ContactsProvider
              filterPanelOpen={false}
              setFilterPanelOpen={jest.fn()}
              viewMode={TableViewModeEnum.Map}
              setViewMode={jest.fn()}
              userOptionsLoading={false}
            >
              <ContactsMap />
            </ContactsProvider>
          </UrlFiltersProvider>
        </GqlMockedProvider>
      </TestRouter>,
    );

    const loadingSpinner = getByRole('progressbar');
    expect(loadingSpinner).toBeInTheDocument();
    waitForElementToBeRemoved(loadingSpinner);
  });
});
