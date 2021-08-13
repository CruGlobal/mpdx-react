import { User } from '../../../graphql/types.generated';
import rootReducer, { Action, AppState } from './rootReducer';

describe('rootReducer', () => {
  const state: AppState = {};

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
