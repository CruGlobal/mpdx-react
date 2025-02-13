import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import theme from 'src/theme';
import { AccordionItem } from './AccordionItem';

const expandedAccordion = 'expandedAccordion';

describe('AccordionItem', () => {
  const onAccordionChange = jest.fn();
  beforeEach(() => {
    onAccordionChange.mockClear();
  });
  it('Should not render Accordion Details', () => {
    const { queryByText } = render(
      <ThemeProvider theme={theme}>
        <AccordionItem
          accordion={expandedAccordion}
          label={'expandedAccordion'}
          expandedAccordion={null}
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
          accordion={expandedAccordion}
          label={'expandedAccordion'}
          expandedAccordion={null}
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
          accordion={expandedAccordion}
          label={'expandedAccordion'}
          expandedAccordion={null}
          onAccordionChange={onAccordionChange}
          value="ValueText"
        >
          Children
        </AccordionItem>
      </ThemeProvider>,
    );

    expect(getByText('expandedAccordion')).toBeInTheDocument();
  });

  it('Should render value', () => {
    const { getByText } = render(
      <ThemeProvider theme={theme}>
        <AccordionItem
          accordion={expandedAccordion}
          label={'expandedAccordion'}
          value={'AccordionValue'}
          expandedAccordion={null}
          onAccordionChange={onAccordionChange}
        >
          Children
        </AccordionItem>
      </ThemeProvider>,
    );

    expect(getByText('AccordionValue')).toBeInTheDocument();
  });

  it('Should render Accordion Details', () => {
    const { getByText } = render(
      <ThemeProvider theme={theme}>
        <AccordionItem
          accordion={expandedAccordion}
          label={'expandedAccordion'}
          value={'AccordionValue'}
          expandedAccordion={expandedAccordion}
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
          accordion={expandedAccordion}
          label={'expandedAccordion'}
          value={'AccordionValue'}
          expandedAccordion={expandedAccordion}
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
          accordion={expandedAccordion}
          label={'expandedAccordion'}
          value={'AccordionValue'}
          expandedAccordion={expandedAccordion}
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
          accordion={expandedAccordion}
          label={'expandedAccordion'}
          value={'AccordionValue'}
          expandedAccordion={expandedAccordion}
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
