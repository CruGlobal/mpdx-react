export interface AppState {
    accountListId: string;
    breadcrumb: string;
}

export type Action = UpdateAccountListIdAction | UpdateBreadcrumbAction;

type UpdateAccountListIdAction = {
    type: 'updateAccountListId';
    accountListId: string;
};

type UpdateBreadcrumbAction = {
    type: 'updateBreadcrumb';
    breadcrumb: string;
};

const rootReducer = (state: AppState, action: Action): AppState => {
    switch (action.type) {
        case 'updateAccountListId':
            return { ...state, accountListId: action.accountListId };
        case 'updateBreadcrumb':
            return { ...state, breadcrumb: action.breadcrumb };
    }
};

export default rootReducer;
