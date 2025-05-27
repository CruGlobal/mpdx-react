import React from 'react';
import { Formik } from 'formik';
import { render, waitFor } from '__tests__/util/testingLibraryReactMock';
import { ImperativeSubmit } from './ImperativeSubmit';

describe('Fix PhoneNumber Contact', () => {
  it('default', async () => {
    const submit = jest.fn();
    render(
      <Formik initialValues={{}} onSubmit={submit}>
        <ImperativeSubmit submitAll={true} />
      </Formik>,
    );

    await waitFor(() => {
      expect(submit).toHaveBeenCalledTimes(1);
    });
  });
});
