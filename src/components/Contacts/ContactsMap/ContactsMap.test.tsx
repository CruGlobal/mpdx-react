import { render, waitForElementToBeRemoved } from '@testing-library/react';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { getGuideOrbClearance } from 'src/components/Assistant/guideOrbClearance';
import { ContactPanelProvider } from 'src/components/Shared/ContactPanelProvider/ContactPanelProvider';
import { TableViewModeEnum } from 'src/components/Shared/Header/ListHeader';
import { UrlFiltersProvider } from 'src/components/Shared/UrlFiltersProvider/UrlFiltersProvider';
import { ContactsProvider } from '../ContactsContext/ContactsContext';
import { ContactsMap } from './ContactsMap';

const renderMap = () =>
  render(
    <TestRouter>
      <GqlMockedProvider>
        <ContactPanelProvider>
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
        </ContactPanelProvider>
      </GqlMockedProvider>
    </TestRouter>,
  );

describe('ContactsMap', () => {
  it('asks the Guide orb to clear the zoom controls while mounted', () => {
    const { unmount } = renderMap();

    expect(getGuideOrbClearance()).toBe(72);
    unmount();
    expect(getGuideOrbClearance()).toBeNull();
  });

  it('renders loading spinner until map loads', () => {
    const { getByRole } = renderMap();

    const loadingSpinner = getByRole('progressbar');
    expect(loadingSpinner).toBeInTheDocument();
    waitForElementToBeRemoved(loadingSpinner);
  });
});
