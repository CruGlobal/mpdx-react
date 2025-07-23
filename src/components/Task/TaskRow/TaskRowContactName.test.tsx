import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import TestRouter from '__tests__/util/TestRouter';
import { ContactPanelProvider } from 'src/components/common/ContactPanelProvider/ContactPanelProvider';
import theme from 'src/theme';
import { TaskRowContactName } from './TaskRowContactName';

interface TestComponentProps {
  lastContact?: boolean;
}

const TestComponent: React.FC<TestComponentProps> = ({
  lastContact = false,
}) => (
  <TestRouter
    router={{
      pathname: '/accountLists/[accountListId]/tasks/[[...contactId]]',
      query: {
        accountListId: 'account-list-1',
        contactId: ['00000000-0000-0000-0000-000000000000'],
        key: 'value',
      },
    }}
  >
    <ThemeProvider theme={theme}>
      <ContactPanelProvider>
        <TaskRowContactName
          contact={{ id: 'contact-1', name: 'John Doe' }}
          itemIndex={0}
          contactsLength={lastContact ? 1 : 2}
        />
      </ContactPanelProvider>
    </ThemeProvider>
  </TestRouter>
);

describe('TaskRowContactName', () => {
  it('should render first contact as a link with a comma', async () => {
    const { getByRole } = render(<TestComponent />);

    expect(getByRole('link', { name: 'John Doe,' })).toHaveAttribute(
      'href',
      '/accountLists/account-list-1/tasks/contact-1?key=value',
    );
  });

  it('should render last contact as a link without a comma', async () => {
    const { getByRole } = render(<TestComponent lastContact />);

    expect(getByRole('link', { name: 'John Doe' })).toBeInTheDocument();
  });
});
