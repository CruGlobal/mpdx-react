export interface AppState {
  accountListId: string;
  breadcrumb: string;
  user?: User;
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
}

export type Action =
  | UpdateAccountListIdAction
  | UpdateBreadcrumbAction
  | UpdateUserAction;

type UpdateAccountListIdAction = {
  type: 'updateAccountListId';
  accountListId: string;
};

type UpdateBreadcrumbAction = {
  type: 'updateBreadcrumb';
  breadcrumb: string;
};

type UpdateUserAction = {
  type: 'updateUser';
  user: User;
};

const rootReducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case 'updateAccountListId':
      return { ...state, accountListId: action.accountListId };
    case 'updateBreadcrumb':
      return { ...state, breadcrumb: action.breadcrumb };
    case 'updateUser':
      return { ...state, user: action.user };
  }
};

export default rootReducer;
