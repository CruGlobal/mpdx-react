import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { I18nextProvider } from 'react-i18next';
import TestRouter from '__tests__/util/TestRouter';
import { render } from '__tests__/util/testingLibraryReactMock';
import i18n from 'src/lib/i18n';
import theme from 'src/theme';
import { ApprovalProcess } from './ApprovalProcess';

const TestComponent: React.FC<{
  onForm?: boolean;
}> = ({ onForm }) => {
  return (
    <ThemeProvider theme={theme}>
      <I18nextProvider i18n={i18n}>
        <TestRouter>
          <ApprovalProcess onForm={onForm} />
        </TestRouter>
      </I18nextProvider>
    </ThemeProvider>
  );
};

describe('ApprovalProcess', () => {
  it('renders correctly', () => {
    const { getByText } = render(<TestComponent onForm={true} />);

    expect(getByText('Approval Process')).toBeInTheDocument();
    expect(getByText('Approvals needed for this request')).toBeInTheDocument();

    expect(
      getByText(/please explain in detail, what are the specific expenses/i),
    ).toBeInTheDocument();
  });
});
