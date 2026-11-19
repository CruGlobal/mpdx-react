import React from 'react';
import { gql, useApolloClient } from '@apollo/client';
import { act, render, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import matchMediaMock from '__tests__/util/matchMediaMock';
import {
  GoalCalculationRole,
  PrimaryBudgetCategory,
  PrimaryBudgetCategoryEnum,
} from 'src/graphql/types.generated';
import { GoalCalculatorTestWrapper } from '../../GoalCalculatorTestWrapper';
import { useGoalCalculator } from '../../Shared/GoalCalculatorContext';
import { GoalCalculatorGrid } from './GoalCalculatorGrid';

interface TestComponentProps {
  primaryBudgetCategoryIndex?: number;
  maxTotal?: number;
}

const TestComponent: React.FC<TestComponentProps> = ({
  primaryBudgetCategoryIndex = 0,
  maxTotal,
}) => {
  const {
    goalCalculationResult: { data },
  } = useGoalCalculator();

  return data ? (
    <GoalCalculatorGrid
      promptText=""
      maxTotal={maxTotal}
      category={
        data.goalCalculation.ministryFamily.primaryBudgetCategories[
          primaryBudgetCategoryIndex
        ]
      }
    />
  ) : null;
};

const RightPanel: React.FC = () => {
  const { rightPanelContent } = useGoalCalculator();

  return <aside aria-label="Right Panel">{rightPanelContent}</aside>;
};

// Simulates a genuine role change after load by updating the cached goal the
// same way the settings form's autosave mutation response does
const ChangeRoleButton: React.FC = () => {
  const client = useApolloClient();

  return (
    <button
      onClick={() =>
        client.writeFragment({
          id: 'GoalCalculation:goal-calculation-1',
          fragment: gql`
            fragment ChangeRole on GoalCalculation {
              role
            }
          `,
          data: { role: GoalCalculationRole.Field },
        })
      }
    >
      Change Role
    </button>
  );
};

// jsdom does no layout, so the grid measures itself as 0px wide and every flex
// column shrinks to nothing. Report the width the grid gets on a real page so it
// sizes its columns the way a browser would.
const setGridWidth = (width: number) => {
  const getBoundingClientRect = HTMLElement.prototype.getBoundingClientRect;
  jest
    .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
    .mockImplementation(function (this: HTMLElement) {
      return this.classList.contains('MuiDataGrid-main')
        ? ({
            x: 0,
            y: 0,
            top: 0,
            left: 0,
            right: width,
            bottom: 400,
            width,
            height: 400,
          } as DOMRect)
        : getBoundingClientRect.call(this);
    });
};

// Column widths in px, keyed by column field
const getColumnWidths = (headers: HTMLElement[]) =>
  Object.fromEntries(
    headers.map((header) => [
      header.dataset.field,
      parseFloat(header.style.width),
    ]),
  );

// jsdom doesn't pass white-space down to child elements, so use the closest
// element that sets it. Browsers default to normal.
const getWhiteSpace = (element: Element): string => {
  for (let node: Element | null = element; node; node = node.parentElement) {
    const { whiteSpace } = getComputedStyle(node);
    if (whiteSpace) {
      return whiteSpace;
    }
  }
  return 'normal';
};

// jsdom's CSS parser drops properties it doesn't know, like -webkit-line-clamp,
// so read the declarations Emotion wrote for the element's own class instead
const getEmotionStyles = (element: Element): Record<string, string> => {
  const className = Array.from(element.classList).find((name) =>
    name.startsWith('css-'),
  );
  const css = Array.from(document.querySelectorAll('style'))
    .map((style) => style.textContent ?? '')
    .join('');
  const declarations =
    css.match(new RegExp(`\\.${className}\\{([^}]*)\\}`))?.[1] ?? '';

  return Object.fromEntries(
    declarations
      .split(';')
      .filter(Boolean)
      .map((declaration) => {
        const [property, ...value] = declaration.split(':');
        return [property.trim(), value.join(':').trim()];
      }),
  );
};

describe('GoalCalculatorGrid', () => {
  it('allows entering a value in the lump sum text field', async () => {
    const mutationSpy = jest.fn();
    const { findByLabelText, findByText } = render(
      <GoalCalculatorTestWrapper onCall={mutationSpy}>
        <TestComponent />
      </GoalCalculatorTestWrapper>,
    );
    const lumpSumButton = await findByText('Lump Sum');
    userEvent.click(lumpSumButton);
    const textField = await findByLabelText('Total');
    userEvent.clear(textField);
    userEvent.type(textField, '1500');
    textField.blur();

    await waitFor(() => {
      expect(mutationSpy).toHaveGraphqlOperation(
        'UpdatePrimaryBudgetCategory',
        {
          input: {
            accountListId: 'account-list-1',
            attributes: {
              id: 'category-ministry',
              directInput: 1500,
            },
          },
        },
      );
    });
  });

  it('adds a new row when Add button is clicked', async () => {
    const mutationSpy = jest.fn();
    const { findByText } = render(
      <GoalCalculatorTestWrapper onCall={mutationSpy}>
        <TestComponent />
      </GoalCalculatorTestWrapper>,
    );

    const addButton = await findByText('Add Line Item');
    userEvent.click(addButton);

    await waitFor(() => {
      expect(mutationSpy).toHaveGraphqlOperation('CreateSubBudgetCategory', {
        input: {
          accountListId: 'account-list-1',
          attributes: {
            primaryBudgetCategoryId: 'category-ministry',
            label: 'New Income',
            amount: 0,
          },
        },
      });
    });
  });

  it("doesn't remove base rows with categories", async () => {
    const { getByText, findByText } = render(
      <GoalCalculatorTestWrapper>
        <TestComponent />
      </GoalCalculatorTestWrapper>,
    );
    const lumpSumButton = await findByText('Line Item');
    userEvent.click(lumpSumButton);

    const compassRow = getByText('Compass Room').closest('[role="row"]');
    userEvent.hover(compassRow!);
    const deleteButton = compassRow?.querySelector('[aria-label="Delete"]');

    expect(deleteButton).not.toBeInTheDocument();
  });

  it('adds and removes a row when delete button is clicked', async () => {
    const mutationSpy = jest.fn();
    const { findByText } = render(
      <GoalCalculatorTestWrapper onCall={mutationSpy}>
        <TestComponent />
      </GoalCalculatorTestWrapper>,
    );

    const otherMinistryRow = (await findByText('Other Ministry')).closest(
      '[role="row"]',
    );
    userEvent.hover(otherMinistryRow!);
    const deleteButton = otherMinistryRow?.querySelector(
      '[aria-label="Delete"]',
    );

    userEvent.click(deleteButton as Element);

    await waitFor(() => {
      expect(mutationSpy).toHaveGraphqlOperation('DeleteSubBudgetCategory', {
        input: {
          accountListId: 'account-list-1',
          id: 'other-ministry',
        },
      });
    });
  });

  it('edits a row name and updates the data', async () => {
    const mutationSpy = jest.fn();
    const { getByDisplayValue, findByText } = render(
      <GoalCalculatorTestWrapper onCall={mutationSpy}>
        <TestComponent />
      </GoalCalculatorTestWrapper>,
    );

    const nameCell = await findByText('Other Ministry');
    userEvent.dblClick(nameCell);

    const input = getByDisplayValue('Other Ministry');
    userEvent.clear(input);
    userEvent.type(input, 'Consulting Work');
    userEvent.tab();

    await waitFor(() => {
      expect(mutationSpy).toHaveGraphqlOperation('UpdateSubBudgetCategory', {
        input: {
          accountListId: 'account-list-1',
          attributes: {
            id: 'other-ministry',
            label: 'Consulting Work',
            amount: 1000,
          },
        },
      });
    });
  });

  it('edits a row amount and updates the total', async () => {
    const mutationSpy = jest.fn();
    const { getByDisplayValue, findByText } = render(
      <GoalCalculatorTestWrapper onCall={mutationSpy}>
        <TestComponent />
      </GoalCalculatorTestWrapper>,
    );

    const otherMinistryRow = (await findByText('Other Ministry')).closest(
      '[role="row"]',
    );
    const amountCell = otherMinistryRow?.querySelector('[data-field="amount"]');
    userEvent.dblClick(amountCell!);

    await waitFor(async () => {
      const input = getByDisplayValue('1000');
      userEvent.clear(input);
      userEvent.type(input, '3000');
    });

    userEvent.tab();

    await waitFor(() => {
      expect(mutationSpy).toHaveGraphqlOperation('UpdateSubBudgetCategory', {
        input: {
          accountListId: 'account-list-1',
          attributes: {
            id: 'other-ministry',
            label: 'Other Ministry',
            amount: 3000,
          },
        },
      });
    });
  });

  it('validates total amount', async () => {
    const { getByDisplayValue, findByText } = render(
      <GoalCalculatorTestWrapper>
        <TestComponent maxTotal={100} />
      </GoalCalculatorTestWrapper>,
    );

    const otherMinistryRow = (await findByText('Other Ministry')).closest(
      '[role="row"]',
    );
    const amountCell = otherMinistryRow?.querySelector('[data-field="amount"]');
    userEvent.dblClick(amountCell!);

    await waitFor(async () => {
      const input = getByDisplayValue('1000');
      userEvent.clear(input);
      userEvent.type(input, '3000');
    });

    userEvent.tab();

    expect(
      await findByText('Total must be less than $100'),
    ).toBeInTheDocument();
  });

  it('validates direct input amount', async () => {
    const { findByText, findByRole, getByRole } = render(
      <GoalCalculatorTestWrapper>
        <TestComponent maxTotal={100} />
      </GoalCalculatorTestWrapper>,
    );

    userEvent.click(await findByRole('button', { name: 'Lump Sum' }));
    const directInput = getByRole('spinbutton', { name: 'Total' });
    userEvent.clear(directInput);
    userEvent.type(directInput, '3000');

    expect(
      await findByText('Total must be less than $100'),
    ).toBeInTheDocument();
  });

  it('prevents editing the total row', async () => {
    const { getAllByLabelText, findByText } = render(
      <GoalCalculatorTestWrapper>
        <TestComponent />
      </GoalCalculatorTestWrapper>,
    );

    const totalRow = (await findByText('Total')).closest('[role="row"]');
    const editableCells = totalRow?.querySelectorAll(
      '[contenteditable="true"]',
    );
    expect(editableCells).toHaveLength(0);
    userEvent.hover(totalRow!);
    const deleteButtons = getAllByLabelText('Delete');
    expect(deleteButtons).toHaveLength(1);
  });

  it('calculates total correctly when multiple operations are performed', async () => {
    const { findByText } = render(
      <GoalCalculatorTestWrapper>
        <TestComponent />
      </GoalCalculatorTestWrapper>,
    );

    const totalRow = (await findByText('Total')).closest('[role="row"]');
    const totalCell = totalRow?.querySelector('[data-field="amount"]');
    expect(totalCell).toHaveTextContent('$1,450');
  });

  it('uses default data when no subBudgetCategories are provided', () => {
    const propsWithoutData = {
      category: {
        id: 'category-1',
        label: 'Outside Income',
        category: PrimaryBudgetCategoryEnum.MinistryAndMedicalMileage,
        directInput: 0,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        subBudgetCategories: [],
      } as unknown as PrimaryBudgetCategory,
    };

    const { getByText } = render(
      <GoalCalculatorTestWrapper>
        <GoalCalculatorGrid {...propsWithoutData} />
      </GoalCalculatorTestWrapper>,
    );

    expect(getByText('Outside Income')).toBeInTheDocument();
  });

  it('switches from lump sum to line items and clears directInput', async () => {
    const mutationSpy = jest.fn();
    const { findByLabelText, findByText } = render(
      <GoalCalculatorTestWrapper onCall={mutationSpy}>
        <TestComponent />
      </GoalCalculatorTestWrapper>,
    );

    const lumpSumButton = await findByText('Lump Sum');
    userEvent.click(lumpSumButton);
    const textField = await findByLabelText('Total');
    userEvent.clear(textField);
    userEvent.type(textField, '2500');

    const lineItemButton = await findByText('Line Item');
    userEvent.click(lineItemButton);

    await waitFor(() => {
      expect(mutationSpy).toHaveGraphqlOperation(
        'UpdatePrimaryBudgetCategory',
        {
          input: {
            accountListId: 'account-list-1',
            attributes: {
              id: 'category-ministry',
              directInput: null,
            },
          },
        },
      );
    });
  });

  it('renders subCategoryPanel', async () => {
    const { getByText, getAllByRole, findByText } = render(
      <GoalCalculatorTestWrapper>
        <RightPanel />
        <TestComponent primaryBudgetCategoryIndex={2} />
      </GoalCalculatorTestWrapper>,
    );
    const lumpSumButton = await findByText('Line Item');
    userEvent.click(lumpSumButton);

    expect(getByText('Internet')).toBeInTheDocument();
    expect(getByText('Phone/Mobile')).toBeInTheDocument();

    const infoButtons = getAllByRole('button', {
      name: 'Show additional info',
    });

    userEvent.click(infoButtons[0]);
    expect(
      await findByText('Only the portion not reimbursed as ministry expense.'),
    ).toBeInTheDocument();
  });

  describe('line item defaults', () => {
    // The wrapper's goal is Office + married (MarriedOffice), so loading it
    // exercises the transition from the pre-load SingleField fallback to the
    // real default type without any user action.
    it('does not overwrite saved amounts when the goal first loads', async () => {
      const mutationSpy = jest.fn();
      const { findByText } = render(
        <GoalCalculatorTestWrapper onCall={mutationSpy}>
          <TestComponent />
        </GoalCalculatorTestWrapper>,
      );

      expect(await findByText('Compass Room')).toBeInTheDocument();
      expect(await findByText('$1,450')).toBeInTheDocument();
      // Flush the post-load render cycle that recomputes the default type
      await act(() => new Promise((resolve) => setTimeout(resolve, 0)));

      expect(mutationSpy).not.toHaveGraphqlOperation('UpdateSubBudgetCategory');
    });

    it('repopulates predefined rows when the default type genuinely changes', async () => {
      const mutationSpy = jest.fn();
      const { findByText, getByRole } = render(
        <GoalCalculatorTestWrapper onCall={mutationSpy}>
          <ChangeRoleButton />
          <TestComponent />
        </GoalCalculatorTestWrapper>,
      );

      expect(await findByText('Compass Room')).toBeInTheDocument();
      await act(() => new Promise((resolve) => setTimeout(resolve, 0)));
      expect(mutationSpy).not.toHaveGraphqlOperation('UpdateSubBudgetCategory');

      // Office -> Field changes the default type from MarriedOffice to
      // MarriedField, which resets predefined rows to the reference amount
      userEvent.click(getByRole('button', { name: 'Change Role' }));

      await waitFor(() =>
        expect(mutationSpy).toHaveGraphqlOperation('UpdateSubBudgetCategory', {
          input: {
            accountListId: 'account-list-1',
            attributes: {
              id: 'compass-room',
              label: 'Compass Room',
              amount: 98,
            },
          },
        }),
      );
    });
  });

  describe('read-only goal', () => {
    it('disables the mode toggle and add buttons and hides the actions column', async () => {
      const mutationSpy = jest.fn();
      const { findByText, getAllByRole, getByRole, queryByLabelText } = render(
        <GoalCalculatorTestWrapper readOnly onCall={mutationSpy}>
          <TestComponent />
        </GoalCalculatorTestWrapper>,
      );

      const otherMinistryRow = (await findByText('Other Ministry')).closest(
        '[role="row"]',
      );

      expect(getByRole('button', { name: 'Lump Sum' })).toBeDisabled();
      expect(getByRole('button', { name: 'Line Item' })).toBeDisabled();
      expect(getByRole('button', { name: 'Add Line Item' })).toBeDisabled();

      userEvent.hover(otherMinistryRow!);
      expect(queryByLabelText('Delete')).not.toBeInTheDocument();

      // The actions column is omitted entirely for read-only goals
      expect(getAllByRole('columnheader')).toHaveLength(2);

      expect(mutationSpy).not.toHaveGraphqlOperation(
        'UpdatePrimaryBudgetCategory',
      );
      expect(mutationSpy).not.toHaveGraphqlOperation('CreateSubBudgetCategory');
      expect(mutationSpy).not.toHaveGraphqlOperation('DeleteSubBudgetCategory');
    });

    it('does not open the cell editor', async () => {
      const mutationSpy = jest.fn();
      const { findByText, queryByDisplayValue } = render(
        <GoalCalculatorTestWrapper readOnly onCall={mutationSpy}>
          <TestComponent />
        </GoalCalculatorTestWrapper>,
      );

      const nameCell = await findByText('Other Ministry');
      userEvent.dblClick(nameCell);

      expect(queryByDisplayValue('Other Ministry')).not.toBeInTheDocument();
      expect(mutationSpy).not.toHaveGraphqlOperation('UpdateSubBudgetCategory');
    });

    it('still displays the calculated total without firing mutations', async () => {
      const mutationSpy = jest.fn();
      const { findByText } = render(
        <GoalCalculatorTestWrapper readOnly onCall={mutationSpy}>
          <TestComponent />
        </GoalCalculatorTestWrapper>,
      );

      expect(await findByText('Total')).toBeInTheDocument();
      expect(await findByText('$1,450')).toBeInTheDocument();

      // Mounting a read-only grid must not fire any mutations, even from the
      // line item defaults effect
      await waitFor(() =>
        expect(mutationSpy).not.toHaveGraphqlOperation(
          'UpdateSubBudgetCategory',
        ),
      );
      expect(mutationSpy).not.toHaveGraphqlOperation(
        'UpdatePrimaryBudgetCategory',
      );
      expect(mutationSpy).not.toHaveGraphqlOperation('CreateSubBudgetCategory');
      expect(mutationSpy).not.toHaveGraphqlOperation('DeleteSubBudgetCategory');
    });

    it('disables the lump sum total field', async () => {
      const mutationSpy = jest.fn();
      const { findByLabelText } = render(
        <GoalCalculatorTestWrapper readOnly onCall={mutationSpy}>
          <TestComponent primaryBudgetCategoryIndex={1} />
        </GoalCalculatorTestWrapper>,
      );

      const totalField = await findByLabelText('Total');
      expect(totalField).toBeDisabled();

      userEvent.type(totalField, '123');
      totalField.blur();

      expect(mutationSpy).not.toHaveGraphqlOperation(
        'UpdatePrimaryBudgetCategory',
      );
    });
  });

  describe('screen sizes', () => {
    const renderGrid = async (screenWidth: number, gridWidth: number) => {
      matchMediaMock({ width: `${screenWidth}px` });
      setGridWidth(gridWidth);

      const result = render(
        <GoalCalculatorTestWrapper>
          <TestComponent />
        </GoalCalculatorTestWrapper>,
      );
      const row = await result.findByRole('row', { name: /Other Ministry/ });

      return { ...result, row };
    };

    afterEach(() => {
      jest.restoreAllMocks();
    });

    describe('on phones', () => {
      // The grid widths the goal page gives the table on each phone
      it.each([
        [390, 284],
        [375, 269],
        [360, 254],
      ])(
        'fits the name, amount and delete columns on a %ipx phone (%ipx grid), with most of the room for the name',
        async (screenWidth, gridWidth) => {
          const { getAllByRole, row } = await renderGrid(
            screenWidth,
            gridWidth,
          );

          const { label, amount, actions } = getColumnWidths(
            getAllByRole('columnheader'),
          );
          // No sideways scrolling to reach the amount or the delete button
          expect(label + amount + actions).toBeLessThanOrEqual(gridWidth);
          // Amount keeps room for totals like $12,345.67
          expect(amount).toBeGreaterThanOrEqual(84);
          // The name gets the bigger share so fewer names are cut off
          expect(label).toBeGreaterThanOrEqual(1.5 * amount);
          expect(
            within(row).getByRole('menuitem', { name: 'Delete' }),
          ).toBeInTheDocument();
        },
      );

      it('gives the name about two thirds of the room beside the Delete button when Amount has room to spare', async () => {
        const { getAllByRole } = await renderGrid(599, 500);

        const { label, amount } = getColumnWidths(getAllByRole('columnheader'));
        expect(label / (label + amount)).toBeCloseTo(2 / 3, 1);
      });

      it('lets a long name wrap onto a second line before it is cut off', async () => {
        const { row } = await renderGrid(390, 284);

        const name = within(row).getByText('Other Ministry');
        expect(getWhiteSpace(name)).toBe('normal');
        expect(getEmotionStyles(name)).toMatchObject({
          display: '-webkit-box',
          '-webkit-box-orient': 'vertical',
          '-webkit-line-clamp': '2',
        });
      });

      it.each([390, 599])(
        'shows a large Delete button that fits inside its row on a %ipx screen',
        async (screenWidth) => {
          const { getAllByRole, row } = await renderGrid(screenWidth, 284);

          // Large icon buttons are 44px, the smallest comfortable tap target
          expect(
            within(row).getByRole('menuitem', { name: 'Delete' }),
          ).toHaveClass('MuiIconButton-sizeLarge');
          expect(parseFloat(row.style.minHeight)).toBeGreaterThanOrEqual(44);
          expect(
            getColumnWidths(getAllByRole('columnheader')).actions,
          ).toBeGreaterThanOrEqual(44);
        },
      );
    });

    describe('on desktop', () => {
      it('keeps the 200px name, 150px amount and 60px delete columns at 600px, even in a narrow grid', async () => {
        const { getAllByRole, row } = await renderGrid(600, 284);

        expect(getColumnWidths(getAllByRole('columnheader'))).toEqual({
          label: 200,
          amount: 150,
          actions: 60,
        });
        expect(
          within(row).getByRole('menuitem', { name: 'Delete' }),
        ).toHaveClass('MuiIconButton-sizeSmall');
        expect(row).toHaveStyle({ minHeight: '38px' });
      });

      it('keeps names on one line', async () => {
        const { row } = await renderGrid(600, 284);

        const name = within(row).getByText('Other Ministry');
        expect(getWhiteSpace(name)).toBe('nowrap');
        expect(getEmotionStyles(name)).not.toHaveProperty('-webkit-line-clamp');
      });
    });
  });
});
