import { Reducer } from 'react';
import { User } from '../../../graphql/types.generated';

export interface AppState {
  accountListId?: string;
  user?: User;
}

export type Action = UpdateAccountListIdAction | UpdateUserAction;

type UpdateAccountListIdAction = {
  type: 'updateAccountListId';
  accountListId: string;
};

type UpdateUserAction = {
  type: 'updateUser';
  user: User;
};

const rootReducer: Reducer<AppState, Action> = (state, action) => {
  switch (action.type) {
    case 'updateAccountListId':
      return { ...state, accountListId: action.accountListId };
    case 'updateUser':
      return { ...state, user: action.user };
  }
};

export default rootReducer;
