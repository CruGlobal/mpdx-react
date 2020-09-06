import { AppState } from './Provider';

export type Action = UpdateCurrentAccountListIdAction;

type UpdateCurrentAccountListIdAction = {
    type: 'updateCurrentAccountListId';
    currentAccountListId: string;
};

const rootReducer = (state: AppState, action: Action): AppState => {
    switch (action.type) {
        case 'updateCurrentAccountListId':
            return { ...state, currentAccountListId: action.currentAccountListId };
    }
};

export default rootReducer;
