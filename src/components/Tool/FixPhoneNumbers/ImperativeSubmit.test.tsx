import React from 'react';
import { Formik } from 'formik';
import { DateTime } from 'luxon';
import { render, waitFor } from '__tests__/util/testingLibraryReactMock';
import { ImperativeSubmit } from './ImperativeSubmit';

describe('Fix PhoneNumber Contact', () => {
  it('default', async () => {
    const submit = jest.fn();
    render(
      <Formik
        initialValues={{
          numbers: [
            {
              id: 'number1',
              source: 'DataServer',
              updatedAt: DateTime.fromISO('2021-06-21').toString(),
              number: '123456',
              primary: true,
            },
            {
              id: 'number2',
              source: 'MPDX',
              updatedAt: DateTime.fromISO('2021-03-23').toString(),
              number: '7891011',
              primary: true,
            },
          ],
        }}
        onSubmit={submit}
      >
        <ImperativeSubmit submitAll={true} />
      </Formik>,
    );

    await waitFor(() => {
      expect(submit).toHaveBeenCalledTimes(1);
    });
  });
});
