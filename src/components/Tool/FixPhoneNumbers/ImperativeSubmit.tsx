import React, { useEffect } from 'react';
import { useFormikContext } from 'formik';

interface Props {
  submitAll: boolean;
}

export const ImperativeSubmit: React.FC<Props> = ({ submitAll }) => {
  const { submitForm } = useFormikContext();

  useEffect(() => {
    if (submitAll) {
      submitForm();
    }
  }, [submitAll]);

  return null;
};
