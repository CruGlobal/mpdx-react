import { render } from '__tests__/util/testingLibraryReactMock';
import { SupportVsGoalCells } from './SupportVsGoalCells';

type Summary = React.ComponentProps<typeof SupportVsGoalCells>['summary'];

const renderCells = (summary: Summary) =>
  render(
    <table>
      <tbody>
        <tr>
          <SupportVsGoalCells summary={summary} />
        </tr>
      </tbody>
    </table>,
  );

const cellTexts = (cells: HTMLElement[]) =>
  cells.map((cell) => cell.textContent);

describe('SupportVsGoalCells', () => {
  it('shows $0.00 and 0.0% when no support has started against a goal', () => {
    const { getAllByRole } = renderCells({
      solidMonthlySupport: 0,
      monthlyGoal: 4000,
      percentOfGoal: 0,
    });

    expect(cellTexts(getAllByRole('cell'))).toEqual([
      '$0.00',
      '$4,000.00',
      '0.0%',
    ]);
  });

  it('shows a dash for unknown support and percent next to a real goal', () => {
    const { getAllByRole } = renderCells({
      solidMonthlySupport: null,
      monthlyGoal: 4000,
      percentOfGoal: null,
    });

    expect(cellTexts(getAllByRole('cell'))).toEqual(['—', '$4,000.00', '—']);
  });
});
