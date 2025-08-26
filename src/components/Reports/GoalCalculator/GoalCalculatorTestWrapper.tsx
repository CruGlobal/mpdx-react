import { ThemeProvider } from '@emotion/react';
import { MockLinkCallHandler } from 'graphql-ergonomock/dist/apollo/MockLink';
import { SnackbarProvider } from 'notistack';
import { DeepPartial } from 'ts-essentials';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { PrimaryBudgetCategoryEnum } from 'src/graphql/types.generated';
import theme from 'src/theme';
import { GoalCalculationQuery } from './Shared/GoalCalculation.generated';
import { GoalCalculatorProvider } from './Shared/GoalCalculatorContext';
import { UpdatePrimaryBudgetCategoryMutation } from './SharedComponents/GoalCalculatorGrid/PrimaryBudgetCategory.generated';
import { 
  CreateSubBudgetCategoryMutation,
  DeleteSubBudgetCategoryMutation,
  UpdateSubBudgetCategoryMutation,
} from './SharedComponents/GoalCalculatorGrid/SubBudgetCategory.generated';

interface GoalCalculatorTestWrapper {
  onCall?: MockLinkCallHandler;
  children?: React.ReactNode;
}

export const goalCalculationMock = {
  goalCalculation: {
    ministryFamily: {
      primaryBudgetCategories: [
        {
          label: 'Ministry & Medical Mileage',
          category: PrimaryBudgetCategoryEnum.MinistryAndMedicalMileage,
        },
        {
          label: 'Account Transfers',
          category: PrimaryBudgetCategoryEnum.AccountTransfers,
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
    },
  },
} satisfies DeepPartial<CreateSubBudgetCategoryMutation>;

export const updateSubBudgetCategoryMock = {
  updateSubBudgetCategory: {
    subBudgetCategory: {
      id: 'updated-mock-id',
      label: 'Updated Income',
      amount: 1000,
    },
  },
} satisfies DeepPartial<UpdateSubBudgetCategoryMutation>;

export const deleteSubBudgetCategoryMock = {
  deleteSubBudgetCategory: {
    id: 'deleted-mock-id',
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
}) => (
  <ThemeProvider theme={theme}>
    <TestRouter
      router={{
        query: {
          accountListId: 'account-list-1',
          goalCalculatorId: 'goal-calculator-1',
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
