import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import { ApolloErgonoMockMap } from 'graphql-ergonomock';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import theme from 'src/theme';
import { mpdBalanceBuffersMock } from '../mpdSupervisorReportMocks';
import { BalanceColorsSection } from './BalanceColorsSection';
import { MpdBalanceBuffersQuery } from './MpdBalanceBuffers.generated';

const renderSection = (
  mocks: ApolloErgonoMockMap = { MpdBalanceBuffers: mpdBalanceBuffersMock() },
) =>
  render(
    <ThemeProvider theme={theme}>
      <GqlMockedProvider<{ MpdBalanceBuffers: MpdBalanceBuffersQuery }>
        mocks={mocks}
      >
        <BalanceColorsSection />
      </GqlMockedProvider>
    </ThemeProvider>,
  );

// Waits for the buffers, so their late render stays inside act
const renderLoaded = async () => {
  const utils = renderSection();
  await utils.findByRole('table');
  return utils;
};

describe('BalanceColorsSection', () => {
  it('explains each balance color beside a sample chip', async () => {
    const { getByRole, getByText } = await renderLoaded();

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
        'No one on the staff account is a supported employee, so it has no buffer. This includes department-funded staff, Staff Emeritus and volunteers. A volunteer or Staff Emeritus married to a supported employee is graded with their spouse.',
      ],
      [
        'No data',
        'No balance has synced for that month (shown as a dash), or the month is before their first payroll (the amount still shows).',
      ],
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

  it('shows a placeholder while the buffers load', async () => {
    const { getByTestId, findByRole, queryByTestId } = renderSection();

    expect(getByTestId('buffers-loading')).toBeInTheDocument();
    await findByRole('row', { name: 'Family $10,000' });
    expect(queryByTestId('buffers-loading')).not.toBeInTheDocument();
  });

  it('says so when the buffers cannot be loaded', async () => {
    const { findByRole, queryByRole } = renderSection({
      MpdBalanceBuffers: {
        mpdBalanceBuffers: () => {
          throw new Error('Buffers unavailable');
        },
      },
    });

    expect(await findByRole('alert')).toHaveTextContent(
      'Could not load the recommended buffers.',
    );
    expect(queryByRole('table')).not.toBeInTheDocument();
  });

  it('says where SOSA staff and single parents fall', async () => {
    const { getByText } = await renderLoaded();

    expect(
      getByText(
        'Family is married with children. Couple is married without children, or a single parent. Single includes staff whose spouse is not on staff (SOSA). Marriage and children come from HR records.',
      ),
    ).toBeInTheDocument();
  });

  it('says what the row chips show and how the report is sorted', async () => {
    const { getByText } = await renderLoaded();

    expect(
      getByText(
        'Each row shows the staff account balance at the end of the last four complete months, newest first. The report lists the lowest balance at the end of last month first.',
      ),
    ).toBeInTheDocument();
  });
});
