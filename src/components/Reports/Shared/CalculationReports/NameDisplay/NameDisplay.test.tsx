import { ThemeProvider } from '@emotion/react';
import { render } from '@testing-library/react';
import theme from 'src/theme';
import { mocks } from '../../../MinisterHousingAllowance/Shared/mockData';
import { NameDisplay } from './NameDisplay';

const titleOne = 'Title One';
const titleTwo = 'Title Two';

interface TestComponentProps {
  showContent?: boolean;
  spouseName?: string;
  spouseId?: string;
}

const TestComponent: React.FC<TestComponentProps> = ({
  showContent,
  spouseName,
  spouseId,
}) => {
  return (
    <ThemeProvider theme={theme}>
      <NameDisplay
        staffName={mocks[1].staffInfo.name}
        staffId={mocks[1].staffInfo.id}
        spouseName={spouseName}
        spouseId={spouseId}
        showContent={showContent}
        titleOne={titleOne}
        titleTwo={titleTwo}
        amountOne={1000}
        amountTwo={20000}
      />
    </ThemeProvider>
  );
};

describe('NameDisplay', () => {
  it('renders correctly for a single person', () => {
    const { getByText } = render(<TestComponent />);

    expect(getByText('Doe, John')).toBeInTheDocument();
    expect(getByText('(000123456)')).toBeInTheDocument();
  });

  it('renders correctly for a married person', () => {
    const { getByText } = render(
      <TestComponent
        spouseName={mocks[1].spouseInfo?.name.split(', ')[1]}
        spouseId={mocks[1].spouseInfo?.id}
      />,
    );

    expect(getByText('Doe, John and Jane')).toBeInTheDocument();
    expect(getByText('000123456 and 100123456')).toBeInTheDocument();
  });

  it('renders content when showContent is true', () => {
    const { getByText } = render(
      <TestComponent
        showContent={true}
        spouseName={mocks[1].spouseInfo?.name.split(', ')[1]}
        spouseId={mocks[1].spouseInfo?.id}
      />,
    );

    expect(getByText('TITLE ONE')).toBeInTheDocument();
    expect(getByText('TITLE TWO')).toBeInTheDocument();
    expect(getByText('$1,000.00')).toBeInTheDocument();
    expect(getByText('$20,000.00')).toBeInTheDocument();
  });
});
