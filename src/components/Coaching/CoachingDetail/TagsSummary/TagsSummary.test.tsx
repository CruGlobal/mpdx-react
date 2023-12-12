import { ThemeProvider } from '@emotion/react';
import { render, waitFor } from '@testing-library/react';
import { DateTime } from 'luxon';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import theme from 'src/theme';
import {
  QueryReportsTagHistoriesArgs,
  ReportsTagHistoriesAssociationEnum,
} from '../../../../../graphql/types.generated';
import { CoachingPeriodEnum } from '../CoachingDetail';
import { TagsSummary } from './TagsSummary';

const accountListId = 'account-list-1';

describe('TagsSummary', () => {
  describe.each([
    { period: CoachingPeriodEnum.Weekly, name: 'weekly' },
    { period: CoachingPeriodEnum.Monthly, name: 'monthly' },
  ])('$name period', ({ period }) => {
    describe.each([
      {
        association: ReportsTagHistoriesAssociationEnum.Contacts,
        name: 'contacts',
      },
      { association: ReportsTagHistoriesAssociationEnum.Tasks, name: 'tasks' },
    ])('$name tags', ({ association }) => {
      it('renders loading', () => {
        const { getAllByTestId } = render(
          <ThemeProvider theme={theme}>
            <GqlMockedProvider>
              <TagsSummary
                accountListId={accountListId}
                period={period}
                association={association}
              />
            </GqlMockedProvider>
          </ThemeProvider>,
        );

        expect(getAllByTestId('Line')).toHaveLength(4);
      });

      it('renders empty', async () => {
        const { findByText } = render(
          <ThemeProvider theme={theme}>
            <GqlMockedProvider<{ TagsSummary: QueryReportsTagHistoriesArgs }>
              mocks={{
                TagsSummary: {
                  reportsTagHistories: {
                    periods: [
                      {
                        tags: [],
                      },
                    ],
                  },
                },
              }}
            >
              <TagsSummary
                accountListId={accountListId}
                period={period}
                association={association}
              />
            </GqlMockedProvider>
          </ThemeProvider>,
        );

        expect(
          await findByText(/^No tags added in last 6/),
        ).toBeInTheDocument();
      });

      it('renders tags', async () => {
        const { getAllByRole, findByRole } = render(
          <ThemeProvider theme={theme}>
            <GqlMockedProvider<{ TagsSummary: QueryReportsTagHistoriesArgs }>
              mocks={{
                TagsSummary: {
                  reportsTagHistories: {
                    periods: [
                      {
                        endDate: DateTime.local(2023, 1, 31).toISODate(),
                        tags: [
                          {
                            id: 'tag-1',
                            name: 'Tag 1',
                            count: 1,
                          },
                          {
                            id: 'tag-2',
                            name: 'Tag 2',
                            count: 2,
                          },
                        ],
                      },
                      {
                        endDate: DateTime.local(2023, 2, 28).toISODate(),
                        tags: [
                          {
                            id: 'tag-1',
                            name: 'Tag 1',
                            count: 3,
                          },
                          {
                            id: 'tag-2',
                            name: 'Tag 2',
                            count: 4,
                          },
                        ],
                      },
                      {
                        endDate: DateTime.local(2023, 1, 31).toISODate(),
                        tags: [
                          {
                            id: 'tag-1',
                            name: 'Tag 1',
                            count: 4,
                          },
                          {
                            id: 'tag-2',
                            name: 'Tag 2',
                            count: 6,
                          },
                        ],
                      },
                    ],
                  },
                },
              }}
            >
              <TagsSummary
                accountListId={accountListId}
                period={period}
                association={association}
              />
            </GqlMockedProvider>
          </ThemeProvider>,
        );

        const table = await findByRole('table', {
          name: /tags summary table$/,
        });
        expect(table).toBeInTheDocument();

        const rows = getAllByRole('row');
        expect(rows).toHaveLength(3);

        expect(rows[0].children[0]).toHaveTextContent('Tag Name');
        expect(rows[0].children[1]).toHaveTextContent('Jan 31');
        expect(rows[0].children[2]).toHaveTextContent('Feb 28');
        expect(rows[0].children[3]).toHaveTextContent('Total');

        expect(rows[1].children[0]).toHaveTextContent('Tag 1');
        expect(rows[1].children[1]).toHaveTextContent('1');
        expect(rows[1].children[2]).toHaveTextContent('3');
        expect(rows[1].children[3]).toHaveTextContent('4');

        expect(rows[2].children[0]).toHaveTextContent('Tag 2');
        expect(rows[2].children[1]).toHaveTextContent('2');
        expect(rows[2].children[2]).toHaveTextContent('4');
        expect(rows[2].children[3]).toHaveTextContent('6');
      });

      it('loads the report', async () => {
        const mutationSpy = jest.fn();
        render(
          <ThemeProvider theme={theme}>
            <GqlMockedProvider onCall={mutationSpy}>
              <TagsSummary
                accountListId={accountListId}
                period={period}
                association={association}
              />
            </GqlMockedProvider>
          </ThemeProvider>,
        );

        await waitFor(() =>
          expect(mutationSpy.mock.calls[0][0]).toMatchObject({
            operation: {
              operationName: 'TagsSummary',
              variables: {
                association,
                range: period === CoachingPeriodEnum.Weekly ? '6w' : '6m',
              },
            },
          }),
        );
      });
    });
  });
});
