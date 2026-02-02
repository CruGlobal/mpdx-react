import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { Formik } from 'formik';
import { I18nextProvider } from 'react-i18next';
import { render } from '__tests__/util/testingLibraryReactMock';
import i18n from 'src/lib/i18n';
import theme from 'src/theme';
import { ApprovalProcess } from './ApprovalProcess';

const onSubmit = jest.fn();

const TestComponent: React.FC<{
  onForm?: boolean;
}> = ({ onForm }) => {
  return (
    <ThemeProvider theme={theme}>
      <I18nextProvider i18n={i18n}>
        <Formik initialValues={{ additionalInfo: '' }} onSubmit={onSubmit}>
          <ApprovalProcess onForm={onForm} />
        </Formik>
      </I18nextProvider>
    </ThemeProvider>
  );
};

describe('ApprovalProcess', () => {
  it('renders correctly', () => {
    const { getByText, getByRole } = render(<TestComponent onForm={true} />);

    expect(getByText('Approval Process')).toBeInTheDocument();
    expect(getByText('Approvals needed for this request')).toBeInTheDocument();

    expect(
      getByText(/please explain in detail, what are the specific expenses/i),
    ).toBeInTheDocument();

    expect(getByRole('textbox')).toBeInTheDocument();
  });
});
