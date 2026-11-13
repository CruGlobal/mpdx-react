import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { GridApi } from '@mui/x-data-grid';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestRouter from '__tests__/util/TestRouter';
import matchMediaMock from '__tests__/util/matchMediaMock';
import { ContactPanelProvider } from 'src/components/Shared/ContactPanelProvider/ContactPanelProvider';
import theme from 'src/theme';
import { PartnerGivingAnalysisTable } from './Table';

const router = {
  pathname:
    '/accountLists/[accountListId]/reports/partnerGivingAnalysis/[[...contactId]]',
  query: {
    accountListId: 'account-list-1',
  },
  isReady: true,
  push: jest.fn(),
};

const isRowChecked = jest.fn();
const onSelectOne = jest.fn();

const mockApiRef = {
  current: {} as GridApi,
};

const mocks = {
  PartnerGivingAnalysis: {
    partnerGivingAnalysis: {
      nodes: [
        {
          donationPeriodAverage: 88.468,
          donationPeriodCount: 176,
          donationPeriodSum: 15218.42,
          firstDonationDate: '2019-01-01',
          lastDonationAmount: 150.92,
          lastDonationCurrency: 'CAD',
          lastDonationDate: '2021-07-07',
          id: '01',
          name: 'Ababa, Aladdin und Jasmine (Princess)',
          pledgeCurrency: 'CAD',
          totalDonations: 15218.42,
        },
        {
          donationPeriodAverage: 71.4,
          donationPeriodCount: 127,
          donationPeriodSum: 13118.42,
          firstDonationDate: '2020-01-01',
          lastDonationAmount: 170.92,
          lastDonationCurrency: 'CAD',
          lastDonationDate: '2021-03-07',
          id: '02',
          name: 'Princess',
          pledgeCurrency: 'CAD',
          totalDonations: 13118.42,
        },
        {
          donationPeriodAverage: 86.4682954545454545,
          donationPeriodCount: 221,
          donationPeriodSum: 25218.42,
          firstDonationDate: '2018-01-01',
          lastDonationAmount: 150.92,
          lastDonationCurrency: 'CAD',
          lastDonationDate: '2021-08-07',
          id: '03',
          name: 'Jasmine (Princess)',
          pledgeCurrency: 'CAD',
          totalDonations: 25218.42,
        },
      ],
      pageInfo: {
        endCursor: 'MTA',
        hasNextPage: false,
        hasPreviousPage: false,
      },
      edges: [{ cursor: 'OA' }, { cursor: 'OQ' }, { cursor: 'MTA' }],
      totalCount: 300,
      totalPageCount: 12,
    },
  },
};

const defaultProps = {
  onSelectOne,
  isRowChecked,
  apiRef: mockApiRef,
};

const Components = () => (
  <ThemeProvider theme={theme}>
    <TestRouter router={router}>
      <ContactPanelProvider>
        <PartnerGivingAnalysisTable
          {...defaultProps}
          data={mocks.PartnerGivingAnalysis.partnerGivingAnalysis.nodes}
        />
      </ContactPanelProvider>
    </TestRouter>
  </ThemeProvider>
);

describe('PartnerGivingAnalysisReportTable', () => {
  it('default', async () => {
    const { getAllByRole, getByRole, queryByTestId } = render(<Components />);

    await waitFor(() => {
      expect(
        queryByTestId('LoadingPartnerGivingAnalysisReport'),
      ).not.toBeInTheDocument();
    });

    expect(getByRole('grid')).toBeInTheDocument();
    expect(getAllByRole('row').length).toBe(4); // 3 rows + header
  });

  it('check event should happen', async () => {
    const { getAllByRole, queryByTestId } = render(<Components />);

    await waitFor(() => {
      expect(
        queryByTestId('LoadingPartnerGivingAnalysisReport'),
      ).not.toBeInTheDocument();
    });

    const checkbox = getAllByRole('checkbox')[0];
    userEvent.click(checkbox);
    expect(onSelectOne).toHaveBeenCalled();
  });

  it('click event should happen', async () => {
    const { getByRole, queryByTestId } = render(<Components />);

    await waitFor(() => {
      expect(
        queryByTestId('LoadingPartnerGivingAnalysisReport'),
      ).not.toBeInTheDocument();
    });

    expect(
      getByRole('link', { name: 'Ababa, Aladdin und Jasmine (Princess)' }),
    ).toHaveAttribute(
      'href',
      '/accountLists/account-list-1/reports/partnerGivingAnalysis/01?tab=Donations',
    );
  });

  describe('column widths', () => {
    const renderWithApiRef = () => {
      const apiRef: React.MutableRefObject<GridApi | null> = { current: null };
      const result = render(
        <ThemeProvider theme={theme}>
          <TestRouter router={router}>
            <ContactPanelProvider>
              <PartnerGivingAnalysisTable
                {...defaultProps}
                apiRef={apiRef}
                data={mocks.PartnerGivingAnalysis.partnerGivingAnalysis.nodes}
              />
            </ContactPanelProvider>
          </TestRouter>
        </ThemeProvider>,
      );
      return { ...result, apiRef };
    };

    // jsdom has no layout, so every element reports a width of 0. To see how
    // the grid sizes its columns, make the grid report the screen width.
    let boundingRectSpy: jest.SpyInstance | undefined;
    const setScreenWidth = (width: number) => {
      matchMediaMock({ width: `${width}px` });
      boundingRectSpy = jest
        .spyOn(Element.prototype, 'getBoundingClientRect')
        .mockReturnValue({
          width,
          height: 800,
          top: 0,
          left: 0,
          right: width,
          bottom: 800,
          x: 0,
          y: 0,
          toJSON: () => ({}),
        });
    };

    afterEach(() => {
      boundingRectSpy?.mockRestore();
      boundingRectSpy = undefined;
    });

    // Fields of the columns the grid drew narrower than their full width
    const squeezedColumns = (apiRef: React.MutableRefObject<GridApi | null>) =>
      (apiRef.current?.getAllColumns() ?? [])
        .filter(({ computedWidth, width }) => computedWidth < (width ?? 0))
        .map(({ field }) => field);

    it('keeps columns at their full width on phones so values are not cut off', async () => {
      matchMediaMock({ width: '390px' });
      const { findByRole, apiRef } = renderWithApiRef();

      expect(await findByRole('grid')).toBeInTheDocument();
      expect(apiRef.current?.getColumn('name').minWidth).toBe(240);
      expect(apiRef.current?.getColumn('donationPeriodSum').minWidth).toBe(130);
      expect(apiRef.current?.getColumn('totalDonations').minWidth).toBe(130);
    });

    it.each([
      { device: 'phone', width: 390 },
      { device: 'small tablet', width: 600 },
      { device: 'tablet', width: 768 },
      { device: 'large tablet', width: 834 },
      { device: 'large tablet in landscape', width: 900 },
      { device: 'small desktop', width: 1024 },
      { device: 'desktop', width: 1280 },
      { device: 'wide desktop', width: 1920 },
    ])(
      'sets every column min width to its full width on a $device ($width px)',
      async ({ width }) => {
        matchMediaMock({ width: `${width}px` });
        const { findByRole, apiRef } = renderWithApiRef();

        expect(await findByRole('grid')).toBeInTheDocument();
        const columns = apiRef.current?.getAllColumns() ?? [];
        expect(columns).toHaveLength(11);
        expect(
          columns.map(({ field, minWidth }) => ({ field, minWidth })),
        ).toEqual(
          columns.map(({ field, width }) => ({ field, minWidth: width })),
        );
      },
    );

    it.each([
      { device: 'phone', width: 390 },
      { device: 'tablet', width: 768 },
      { device: 'small desktop', width: 1024 },
      { device: 'desktop', width: 1280 },
    ])(
      'scrolls sideways instead of squeezing the columns on a $device ($width px)',
      async ({ width }) => {
        setScreenWidth(width);
        const { findByRole, apiRef } = renderWithApiRef();

        expect(await findByRole('grid')).toBeInTheDocument();
        await waitFor(() =>
          expect(apiRef.current?.getRootDimensions().root.width).toBe(width),
        );
        expect(squeezedColumns(apiRef)).toEqual([]);
        const { columnsTotalWidth, hasScrollX } =
          apiRef.current?.getRootDimensions() ?? {};
        expect(columnsTotalWidth).toBeGreaterThan(width);
        expect(hasScrollX).toBe(true);
      },
    );

    it('stretches the columns to fill a wide screen without scrolling', async () => {
      setScreenWidth(1920);
      const { findByRole, apiRef } = renderWithApiRef();

      expect(await findByRole('grid')).toBeInTheDocument();
      await waitFor(() =>
        expect(apiRef.current?.getRootDimensions().root.width).toBe(1920),
      );
      expect(squeezedColumns(apiRef)).toEqual([]);
      const { columnsTotalWidth, hasScrollX } =
        apiRef.current?.getRootDimensions() ?? {};
      expect(columnsTotalWidth).toBeCloseTo(1920, 0);
      expect(hasScrollX).toBe(false);
      // A flex column grows past its full width to use the extra space
      const giftCount = apiRef.current?.getColumn('donationPeriodCount');
      expect(giftCount?.computedWidth).toBeGreaterThan(giftCount?.width ?? 0);
    });

    it('renders a header for every column on a tablet', async () => {
      matchMediaMock({ width: '768px' });
      const { findByRole, getAllByRole } = renderWithApiRef();

      expect(await findByRole('grid')).toBeInTheDocument();
      expect(
        getAllByRole('columnheader').map((header) => header.textContent),
      ).toEqual([
        '',
        'Name',
        'Status',
        'Commitment Amount',
        'Gift Total',
        'Gift Count',
        'Gift Average',
        'First Gift Date',
        'Last Gift Amount',
        'Last Gift Date',
        'Lifetime Total',
      ]);
    });
  });
});
