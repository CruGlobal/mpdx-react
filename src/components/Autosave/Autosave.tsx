import React, { useEffect, useCallback, ReactElement } from 'react';
import { useFormikContext } from 'formik';
import { debounce } from 'lodash/fp';

interface Props {
    delay?: number;
}

const Autosave = ({ delay = 1000 }: Props): ReactElement => {
    const { submitForm, values } = useFormikContext();
    const debouncedSubmit = useCallback(debounce(delay, submitForm), [submitForm, delay]);
    useEffect(() => debouncedSubmit, [debouncedSubmit, values]);

    return <></>;
};

export default Autosave;
