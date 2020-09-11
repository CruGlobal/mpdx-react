import rootReducer, { Action, AppState } from './rootReducer';

describe(rootReducer.name, () => {
    const state: AppState = {
        accountListId: null,
        breadcrumb: null,
    };

    describe('updateAccountListId', () => {
        it('updates accountListId state', () => {
            const action: Action = { type: 'updateAccountListId', accountListId: 'abc' };
            expect(rootReducer(state, action).accountListId).toEqual('abc');
        });
    });

    describe('updateBreadcrumb', () => {
        it('updates breadcrumb state', () => {
            const action: Action = { type: 'updateBreadcrumb', breadcrumb: 'abc' };
            expect(rootReducer(state, action).breadcrumb).toEqual('abc');
        });
    });
});
