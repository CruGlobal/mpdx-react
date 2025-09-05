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
  useDynamicMocks?: boolean;
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

interface MockOperation {
  variables?: {
    input?: {
      attributes?: {
        id?: string;
        label?: string;
        amount?: number;
        category?: null;
        primaryBudgetCategoryId?: string;
      };
      id?: string;
      directInput?: number | null;
      accountListId?: string;
    };
  };
}

// Dynamic mock handlers
export const createDynamicMocks = () => {
  const createdItems = new Map<
    string,
    { id: string; label: string; amount: number; category: null }
  >();

  return {
    CreateSubBudgetCategory: (operation: MockOperation) => {
      const dynamicId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newItem = {
        id: dynamicId,
        label: operation.variables?.input?.attributes?.label || 'New Income',
        amount: operation.variables?.input?.attributes?.amount || 0,
        category: operation.variables?.input?.attributes?.category || null,
      };
      createdItems.set(dynamicId, newItem);

      return {
        createSubBudgetCategory: {
          subBudgetCategory: newItem,
        },
      };
    },

    UpdateSubBudgetCategory: (operation: MockOperation) => {
      const updatedItem = {
        id: operation.variables?.input?.attributes?.id,
        label: operation.variables?.input?.attributes?.label,
        amount: operation.variables?.input?.attributes?.amount,
        category: operation.variables?.input?.attributes?.category || null,
      };

      return {
        updateSubBudgetCategory: {
          subBudgetCategory: updatedItem,
        },
      };
    },

    DeleteSubBudgetCategory: (operation: MockOperation) => {
      const idToDelete = operation.variables?.input?.id;
      if (idToDelete) {
        createdItems.delete(idToDelete);
      }

      return {
        deleteSubBudgetCategory: {
          id: idToDelete,
        },
      };
    },

    UpdatePrimaryBudgetCategory: (operation: MockOperation) => {
      const updatedCategory = {
        id: operation.variables?.input?.id,
        directInput: operation.variables?.input?.directInput,
      };

      return {
        updatePrimaryBudgetCategory: {
          primaryBudgetCategory: updatedCategory,
        },
      };
    },
  };
};

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
  useDynamicMocks = false,
}) => {
  const dynamicMocks = useDynamicMocks ? createDynamicMocks() : undefined;

  const handleCall =
    onCall ||
    ((operation) => {
      if (useDynamicMocks && dynamicMocks) {
        if (operation.operation.operationName === 'CreateSubBudgetCategory') {
          return dynamicMocks.CreateSubBudgetCategory(
            operation as MockOperation,
          );
        }
        if (operation.operation.operationName === 'UpdateSubBudgetCategory') {
          return dynamicMocks.UpdateSubBudgetCategory(
            operation as MockOperation,
          );
        }
        if (operation.operation.operationName === 'DeleteSubBudgetCategory') {
          return dynamicMocks.DeleteSubBudgetCategory(
            operation as MockOperation,
          );
        }
        if (
          operation.operation.operationName === 'UpdatePrimaryBudgetCategory'
        ) {
          return dynamicMocks.UpdatePrimaryBudgetCategory(
            operation as MockOperation,
          );
        }
      }
      return null;
    });

  return (
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
            onCall={handleCall}
          >
            <GoalCalculatorProvider>{children}</GoalCalculatorProvider>
          </GqlMockedProvider>
        </SnackbarProvider>
      </TestRouter>
    </ThemeProvider>
  );
};
