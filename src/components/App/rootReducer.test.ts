import { User } from '../../../graphql/types.generated';
import rootReducer, { Action, AppState } from './rootReducer';

describe('rootReducer', () => {
  const state: AppState = {
    accountListId: undefined,
  };

  describe('updateAccountListId', () => {
    it('updates accountListId state', () => {
      const action: Action = {
        type: 'updateAccountListId',
        accountListId: 'abc',
      };
      expect(rootReducer(state, action).accountListId).toEqual('abc');
    });
  });

  describe('updateUser', () => {
    it('updates user state', () => {
      const user = {
        id: 'user-1',
        firstName: 'John',
        lastName: 'Smith',
      } as User;
      const action: Action = { type: 'updateUser', user };
      expect(rootReducer(state, action).user).toEqual(user);
    });
  });
});
