import { Reducer } from 'react';
import { User } from '../../../graphql/types.generated';

export interface AppState {
  user?: User;
}

export type Action = UpdateUserAction;

type UpdateUserAction = {
  type: 'updateUser';
  user: User;
};

const rootReducer: Reducer<AppState, Action> = (state, action) => {
  switch (action.type) {
    case 'updateUser':
      return { ...state, user: action.user };
  }
};

export default rootReducer;
