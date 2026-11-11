import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import theme from 'src/theme';
import { mpdBalanceBuffersMock } from '../mpdSupervisorReportMocks';
import { BalanceColorsSection } from './BalanceColorsSection';
import { MpdBalanceBuffersQuery } from './MpdBalanceBuffers.generated';

const renderSection = () =>
  render(
    <ThemeProvider theme={theme}>
      <GqlMockedProvider<{ MpdBalanceBuffers: MpdBalanceBuffersQuery }>
        mocks={{ MpdBalanceBuffers: mpdBalanceBuffersMock() }}
      >
        <BalanceColorsSection />
      </GqlMockedProvider>
    </ThemeProvider>,
  );

describe('BalanceColorsSection', () => {
  it('explains each balance color beside a sample chip', () => {
    const { getByRole, getByText } = renderSection();

    expect(getByRole('heading', { name: 'Colors' })).toBeInTheDocument();
    [
      [
        'At or above buffer',
        "The balance was at or above the household's recommended buffer.",
      ],
      [
        'Below buffer',
        "The balance was $0 or more, but below the household's buffer.",
      ],
      ['Below $0', 'The balance was below zero.'],
      [
        'Not graded',
        'Part-time field staff and volunteers have no buffer to measure against.',
      ],
      ['No data', 'No balance has synced for that month.'],
    ].forEach(([label, explanation]) => {
      expect(getByText(label).parentElement).toHaveTextContent(
        `${label}: ${explanation}`,
      );
    });
    // Sample chips use the row chip's whole-dollar formatting
    expect(getByText('-$850')).toBeInTheDocument();
  });

  it('lists the buffer for each household type from the API', async () => {
    const { findByRole, getByRole } = renderSection();

    expect(
      await findByRole('row', { name: 'Family $10,000' }),
    ).toBeInTheDocument();
    expect(getByRole('row', { name: 'Couple $8,000' })).toBeInTheDocument();
    expect(getByRole('row', { name: 'Single $5,000' })).toBeInTheDocument();
  });

  it('says where SOSA staff and single parents fall', () => {
    const { getByText } = renderSection();

    expect(
      getByText(
        'Family is married with children. Couple is married without children, or a single parent. Single includes staff whose spouse is not on staff (SOSA). Marriage and children come from HR records.',
      ),
    ).toBeInTheDocument();
  });

  it('says what the row chips show and how the report is sorted', () => {
    const { getByText } = renderSection();

    expect(
      getByText(
        'Each row shows the staff account balance at the end of the last four complete months, newest first. The report lists the lowest balance at the end of last month first.',
      ),
    ).toBeInTheDocument();
  });
});
