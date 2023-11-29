import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import theme from 'src/theme';
import { AccordionItem } from './AccordionItem';

const expandedPanel = 'expandedPanel';

describe('AccordionItem', () => {
  const onAccordionChange = jest.fn();
  beforeEach(() => {
    onAccordionChange.mockClear();
  });
  it('Should not render Accordian Details', () => {
    const { queryByText } = render(
      <ThemeProvider theme={theme}>
        <AccordionItem
          label={'expandedPanel'}
          expandedPanel=""
          onAccordionChange={onAccordionChange}
          value="ValueText"
        >
          Children
        </AccordionItem>
      </ThemeProvider>,
    );

    expect(queryByText('Children')).not.toBeInTheDocument();
  });
  it('Should not render value', () => {
    const { queryByTestId } = render(
      <ThemeProvider theme={theme}>
        <AccordionItem
          label={'expandedPanel'}
          expandedPanel=""
          onAccordionChange={onAccordionChange}
          value=""
        >
          Children
        </AccordionItem>
      </ThemeProvider>,
    );

    expect(queryByTestId('AccordionSummaryValue')).not.toBeInTheDocument();
  });

  it('Should render label', () => {
    const { getByText } = render(
      <ThemeProvider theme={theme}>
        <AccordionItem
          label={'expandedPanel'}
          expandedPanel=""
          onAccordionChange={onAccordionChange}
          value="ValueText"
        >
          Children
        </AccordionItem>
      </ThemeProvider>,
    );

    expect(getByText('expandedPanel')).toBeInTheDocument();
  });

  it('Should render value', () => {
    const { getByText } = render(
      <ThemeProvider theme={theme}>
        <AccordionItem
          label={'expandedPanel'}
          value={'AccordianValue'}
          expandedPanel=""
          onAccordionChange={onAccordionChange}
        >
          Children
        </AccordionItem>
      </ThemeProvider>,
    );

    expect(getByText('AccordianValue')).toBeInTheDocument();
  });

  it('Should render Accordian Details', () => {
    const { getByText } = render(
      <ThemeProvider theme={theme}>
        <AccordionItem
          label={'expandedPanel'}
          value={'AccordianValue'}
          expandedPanel={expandedPanel}
          onAccordionChange={onAccordionChange}
        >
          Children
        </AccordionItem>
      </ThemeProvider>,
    );

    expect(getByText('Children')).toBeInTheDocument();
  });

  it('Should render Children with FullWidth', () => {
    const { getByText } = render(
      <ThemeProvider theme={theme}>
        <AccordionItem
          label={'expandedPanel'}
          value={'AccordianValue'}
          expandedPanel={expandedPanel}
          fullWidth={true}
          onAccordionChange={onAccordionChange}
        >
          Children
        </AccordionItem>
      </ThemeProvider>,
    );

    expect(getByText('Children')).toBeInTheDocument();
  });

  it('Should render Children and Image', () => {
    const { getByText } = render(
      <ThemeProvider theme={theme}>
        <AccordionItem
          label={'expandedPanel'}
          value={'AccordianValue'}
          expandedPanel={expandedPanel}
          fullWidth={true}
          image={'image.png'}
          onAccordionChange={onAccordionChange}
        >
          Children
        </AccordionItem>
      </ThemeProvider>,
    );

    expect(getByText('Children')).toBeInTheDocument();
    expect(getByText('image.png')).toBeInTheDocument();
  });
  it('Should run onAccordionChange()', () => {
    const { getByTestId } = render(
      <ThemeProvider theme={theme}>
        <AccordionItem
          label={'expandedPanel'}
          value={'AccordianValue'}
          expandedPanel={expandedPanel}
          onAccordionChange={onAccordionChange}
        >
          Children
        </AccordionItem>
      </ThemeProvider>,
    );

    userEvent.click(getByTestId('AccordionSummaryValue'));
    expect(onAccordionChange).toHaveBeenCalled();
  });
});
