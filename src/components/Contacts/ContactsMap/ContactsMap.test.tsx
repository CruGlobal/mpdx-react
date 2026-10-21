import { useEffect } from 'react';
import { GoogleMapProps } from '@react-google-maps/api';
import { act, render, waitForElementToBeRemoved } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { ContactPanelProvider } from 'src/components/Shared/ContactPanelProvider/ContactPanelProvider';
import { TableViewModeEnum } from 'src/components/Shared/Header/ListHeader';
import { UrlFiltersProvider } from 'src/components/Shared/UrlFiltersProvider/UrlFiltersProvider';
import {
  ContactsContext,
  ContactsProvider,
  ContactsType,
} from '../ContactsContext/ContactsContext';
import { ContactsMap } from './ContactsMap';
import { Coordinates } from './coordinates';

const mockUseJsApiLoader = jest.fn();
let mockMapProps: GoogleMapProps;
const fitBounds = jest.fn();
const mockMap = { fitBounds };

jest.mock('@react-google-maps/api', () => ({
  useJsApiLoader: () => mockUseJsApiLoader(),
  GoogleMap: (props: GoogleMapProps) => {
    mockMapProps = props;
    useEffect(() => {
      props.onLoad?.(mockMap as unknown as google.maps.Map);
    }, []);
    return null;
  },
}));

class MockLatLngBounds {
  south = Infinity;
  north = -Infinity;
  west = Infinity;
  east = -Infinity;

  extend({ lat, lng }: { lat: number; lng: number }) {
    this.south = Math.min(this.south, lat);
    this.north = Math.max(this.north, lat);
    this.west = Math.min(this.west, lng);
    this.east = Math.max(this.east, lng);
    return this;
  }

  isEmpty() {
    return this.south > this.north;
  }

  equals(other: MockLatLngBounds | null) {
    return (
      !!other &&
      other.south === this.south &&
      other.north === this.north &&
      other.west === this.west &&
      other.east === this.east
    );
  }
}

const contact = (id: string, lat: number, lng: number): Coordinates => ({
  id,
  name: `Contact ${id}`,
  avatar: '',
  lat,
  lng,
});

const firstPage = [contact('1', 10, 20), contact('2', 30, 40)];

let mapRef: ContactsType['mapRef'];

interface TestComponentProps {
  mapData: Coordinates[];
}

const TestComponent: React.FC<TestComponentProps> = ({ mapData }) => (
  <TestRouter>
    <GqlMockedProvider>
      <ContactPanelProvider>
        <ContactsContext.Provider
          value={
            {
              mapData,
              mapRef,
              selected: null,
              setSelected: jest.fn(),
            } as unknown as ContactsType
          }
        >
          <ContactsMap />
        </ContactsContext.Provider>
      </ContactPanelProvider>
    </GqlMockedProvider>
  </TestRouter>
);

const finishMoving = () => act(() => mockMapProps.onIdle?.());

describe('ContactsMap', () => {
  beforeEach(() => {
    mockUseJsApiLoader.mockReturnValue({ isLoaded: true });
    mapRef = { current: null };
    window.google = {
      maps: { LatLngBounds: MockLatLngBounds },
    } as unknown as typeof google;
  });

  afterEach(() => {
    // @ts-expect-error Clean up the fake Google Maps API
    delete window.google;
  });

  it('renders loading spinner until map loads', () => {
    mockUseJsApiLoader.mockReturnValue({ isLoaded: false });

    const { getByRole } = render(
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

    const loadingSpinner = getByRole('progressbar');
    expect(loadingSpinner).toBeInTheDocument();
    waitForElementToBeRemoved(loadingSpinner);
  });

  it('fits the map to the contacts as more pages load', () => {
    const { rerender } = render(<TestComponent mapData={firstPage} />);
    expect(fitBounds).toHaveBeenCalledTimes(1);
    finishMoving();

    rerender(<TestComponent mapData={[...firstPage, contact('3', 50, 60)]} />);
    expect(fitBounds).toHaveBeenCalledTimes(2);
  });

  it('does not refit when a new page does not change the bounds', () => {
    const { rerender } = render(<TestComponent mapData={firstPage} />);
    finishMoving();

    rerender(<TestComponent mapData={[...firstPage, contact('3', 20, 30)]} />);
    expect(fitBounds).toHaveBeenCalledTimes(1);
  });

  it('ignores camera changes caused by fitting the map', () => {
    const { rerender, queryByRole } = render(
      <TestComponent mapData={firstPage} />,
    );
    act(() => mockMapProps.onZoomChanged?.());
    act(() => mockMapProps.onCenterChanged?.());
    finishMoving();

    expect(
      queryByRole('button', { name: 'Zoom to Fit' }),
    ).not.toBeInTheDocument();

    rerender(<TestComponent mapData={[...firstPage, contact('3', 50, 60)]} />);
    expect(fitBounds).toHaveBeenCalledTimes(2);
  });

  it('stops fitting the map after the user moves it until they click Zoom to Fit', () => {
    const { rerender, getByRole, queryByRole } = render(
      <TestComponent mapData={firstPage} />,
    );
    finishMoving();

    act(() => mockMapProps.onZoomChanged?.());
    const nextPage = [...firstPage, contact('3', 50, 60)];
    rerender(<TestComponent mapData={nextPage} />);
    expect(fitBounds).toHaveBeenCalledTimes(1);

    userEvent.click(getByRole('button', { name: 'Zoom to Fit' }));
    expect(fitBounds).toHaveBeenCalledTimes(2);
    expect(fitBounds).toHaveBeenLastCalledWith(
      expect.objectContaining({ north: 50, east: 60 }),
    );
    expect(
      queryByRole('button', { name: 'Zoom to Fit' }),
    ).not.toBeInTheDocument();

    finishMoving();
    rerender(<TestComponent mapData={[...nextPage, contact('4', 70, 80)]} />);
    expect(fitBounds).toHaveBeenCalledTimes(3);
  });
});
