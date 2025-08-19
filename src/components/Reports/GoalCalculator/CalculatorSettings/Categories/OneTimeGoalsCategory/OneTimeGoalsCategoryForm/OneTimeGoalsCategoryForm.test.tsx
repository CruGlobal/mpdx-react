import React from 'react';
import { fireEvent, render } from '@testing-library/react';
import { Formik } from 'formik';
import TestWrapper from '__tests__/util/TestWrapper';
import { OneTimeGoalsCategoryForm } from './OneTimeGoalsCategoryForm';

const defaultValues = {
  additionalGoals: [
    { label: 'Emergency Fund', amount: 5000 },
    { label: 'Equipment', amount: 2000 },
  ],
};

const renderWithFormik = (initialValues = defaultValues) => {
  return render(
    <TestWrapper>
      <Formik initialValues={initialValues} onSubmit={() => {}}>
        <OneTimeGoalsCategoryForm />
      </Formik>
    </TestWrapper>,
  );
};

describe('OneTimeGoalsCategoryForm', () => {
  it('renders existing goals', () => {
    const { getByDisplayValue } = renderWithFormik();

    expect(getByDisplayValue('Emergency Fund')).toBeInTheDocument();
    expect(getByDisplayValue('5000')).toBeInTheDocument();
    expect(getByDisplayValue('Equipment')).toBeInTheDocument();
    expect(getByDisplayValue('2000')).toBeInTheDocument();
  });

  it('renders add goal button', () => {
    const { getByRole } = renderWithFormik();

    expect(getByRole('button', { name: '+ Add Goal' })).toBeInTheDocument();
  });

  it('adds a new goal when add button is clicked', () => {
    const { getByRole, getAllByLabelText } = renderWithFormik();

    const addButton = getByRole('button', { name: '+ Add Goal' });
    fireEvent.click(addButton);

    expect(getAllByLabelText('Goal Label')).toHaveLength(3);
    expect(getAllByLabelText('Amount')).toHaveLength(3);
  });

  it('removes a goal when delete button is clicked', () => {
    const { getAllByLabelText } = renderWithFormik();

    expect(getAllByLabelText('Goal Label')).toHaveLength(2);
    expect(getAllByLabelText('Delete goal')).toHaveLength(2);

    const deleteButtons = getAllByLabelText('Delete goal');
    fireEvent.click(deleteButtons[0]);

    expect(getAllByLabelText('Goal Label')).toHaveLength(1);
    expect(getAllByLabelText('Delete goal')).toHaveLength(1);
  });

  it('updates goal label when input changes', () => {
    const { getByDisplayValue } = renderWithFormik();

    const labelInput = getByDisplayValue('Emergency Fund');
    fireEvent.change(labelInput, { target: { value: 'Updated Fund' } });

    expect(getByDisplayValue('Updated Fund')).toBeInTheDocument();
  });

  it('updates goal amount when input changes', () => {
    const { getByDisplayValue } = renderWithFormik();

    const amountInput = getByDisplayValue('5000');
    fireEvent.change(amountInput, { target: { value: '7500' } });

    expect(getByDisplayValue('7500')).toBeInTheDocument();
  });

  it('renders with empty goals list', () => {
    const { getByRole, queryAllByLabelText } = renderWithFormik({
      additionalGoals: [],
    });

    expect(queryAllByLabelText('Goal Label')).toHaveLength(0);
    expect(queryAllByLabelText('Amount')).toHaveLength(0);

    expect(getByRole('button', { name: '+ Add Goal' })).toBeInTheDocument();
  });

  it('renders currency adornment for amount fields', () => {
    const { getAllByLabelText } = renderWithFormik();

    const amountFields = getAllByLabelText('Amount');
    amountFields.forEach((field) => {
      expect(field.closest('.MuiInputBase-root')).toBeInTheDocument();
    });
  });

  it('sets correct input attributes for amount fields', () => {
    const { getAllByLabelText } = renderWithFormik();

    const amountFields = getAllByLabelText('Amount');
    amountFields.forEach((field) => {
      expect(field).toHaveAttribute('type', 'number');
      expect(field).toHaveAttribute('min', '0');
      expect(field).toHaveAttribute('step', '0.01');
    });
  });
});
