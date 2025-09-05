import { ThemeProvider } from '@emotion/react';
import { MockLinkCallHandler } from 'graphql-ergonomock/dist/apollo/MockLink';
import { SnackbarProvider } from 'notistack';
import { DeepPartial } from 'ts-essentials';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import {
  PrimaryBudgetCategoryEnum,
  SubBudgetCategoryEnum,
} from 'src/graphql/types.generated';
import theme from 'src/theme';
import { GoalCalculationQuery } from './Shared/GoalCalculation.generated';
import { GoalCalculatorProvider } from './Shared/GoalCalculatorContext';
import {
  CreateSubBudgetCategoryMutation,
  DeleteSubBudgetCategoryMutation,
  UpdatePrimaryBudgetCategoryMutation,
  UpdateSubBudgetCategoryMutation,
} from './SharedComponents/GoalCalculatorGrid/GoalCalculatorGrid.generated';

interface GoalCalculatorTestWrapper {
  onCall?: MockLinkCallHandler;
  children?: React.ReactNode;
}

export const goalCalculationMock = {
  goalCalculation: {
    ministryFamily: {
      primaryBudgetCategories: [
        {
          id: 'category-1',
          label: 'Ministry & Medical Mileage',
          category: PrimaryBudgetCategoryEnum.MinistryAndMedicalMileage,
          directInput: 0,
          subBudgetCategories: [
            {
              id: 'sub-1',
              label: 'Compass Room',
              amount: 500,
              category: SubBudgetCategoryEnum.Other,
            },
            {
              id: 'sub-2',
              label: 'Desk',
              amount: 300,
              category: SubBudgetCategoryEnum.PersonalFurniture,
            },
            {
              id: 'sub-3',
              label: 'Eyes PaintBrush Bible',
              amount: 200,
              category: SubBudgetCategoryEnum.Other,
            },
            {
              id: 'sub-4',
              label: 'Custom Item 1',
              amount: 100,
              category: null,
            },
            {
              id: 'sub-5',
              label: 'Custom Item 2',
              amount: 150,
              category: null,
            },
            {
              id: 'sub-6',
              label: 'Custom Item 3',
              amount: 200,
              category: null,
            },
          ],
        },
        {
          id: 'category-2',
          label: 'Account Transfers',
          category: PrimaryBudgetCategoryEnum.AccountTransfers,
          directInput: 0,
          subBudgetCategories: [],
        },
      ],
    },
  },
} satisfies DeepPartial<GoalCalculationQuery>;

export const createSubBudgetCategoryMock = {
  createSubBudgetCategory: {
    subBudgetCategory: {
      id: 'new-mock-id',
      label: 'New Income',
      amount: 0,
      category: null,
    },
  },
} satisfies DeepPartial<CreateSubBudgetCategoryMutation>;

export const updateSubBudgetCategoryMock = {
  updateSubBudgetCategory: {
    subBudgetCategory: {
      id: 'updated-mock-id',
      label: 'Updated Income',
      category: null,
      amount: 1000,
    },
  },
} satisfies DeepPartial<UpdateSubBudgetCategoryMutation>;

export const deleteSubBudgetCategoryMock = {
  deleteSubBudgetCategory: {
    id: '1',
  },
} satisfies DeepPartial<DeleteSubBudgetCategoryMutation>;

export const updatePrimaryBudgetCategoryMock = {
  updatePrimaryBudgetCategory: {
    primaryBudgetCategory: {
      directInput: 5000,
    },
  },
} satisfies DeepPartial<UpdatePrimaryBudgetCategoryMutation>;

export const GoalCalculatorTestWrapper: React.FC<GoalCalculatorTestWrapper> = ({
  children,
  onCall,
}) => {
  return (
    <ThemeProvider theme={theme}>
      <TestRouter
        router={{
          query: {
            accountListId: 'account-list-1',
            goalCalculationId: 'goal-calculator-1',
          },
        }}
      >
        <SnackbarProvider>
          <GqlMockedProvider<{
            GoalCalculation: GoalCalculationQuery;
            CreateSubBudgetCategory: CreateSubBudgetCategoryMutation;
            UpdateSubBudgetCategory: UpdateSubBudgetCategoryMutation;
            DeleteSubBudgetCategory: DeleteSubBudgetCategoryMutation;
            UpdatePrimaryBudgetCategory: UpdatePrimaryBudgetCategoryMutation;
          }>
            mocks={{
              GoalCalculation: goalCalculationMock,
              CreateSubBudgetCategory: createSubBudgetCategoryMock,
              UpdateSubBudgetCategory: updateSubBudgetCategoryMock,
              DeleteSubBudgetCategory: deleteSubBudgetCategoryMock,
              UpdatePrimaryBudgetCategory: updatePrimaryBudgetCategoryMock,
            }}
            onCall={onCall}
          >
            <GoalCalculatorProvider>{children}</GoalCalculatorProvider>
          </GqlMockedProvider>
        </SnackbarProvider>
      </TestRouter>
    </ThemeProvider>
  );
};
