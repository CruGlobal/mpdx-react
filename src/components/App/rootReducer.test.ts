import { User } from '../../../graphql/types.generated';
import rootReducer, { Action, AppState } from './rootReducer';

describe('rootReducer', () => {
  const state: AppState = {
    accountListId: null,
    breadcrumb: null,
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

  describe('updateBreadcrumb', () => {
    it('updates breadcrumb state', () => {
      const action: Action = { type: 'updateBreadcrumb', breadcrumb: 'abc' };
      expect(rootReducer(state, action).breadcrumb).toEqual('abc');
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
