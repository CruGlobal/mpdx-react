import React, { ReactElement, useEffect } from 'react';
import { useApp } from '../components/App';
import { Action } from '../components/App/rootReducer';

const withDispatch = (...actions: Action[]) => (StoryFn): ReactElement => {
    const { dispatch } = useApp();
    useEffect(() => {
        actions.map((action) => dispatch(action));
    }, []);
    return <StoryFn />;
};

export default withDispatch;
