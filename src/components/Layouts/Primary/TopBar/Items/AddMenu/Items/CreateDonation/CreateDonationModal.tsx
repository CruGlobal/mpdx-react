import React from 'react';
import * as yup from 'yup';
import { Formik } from 'formik';

interface Props {
  accountListId: string;
  handleClose: () => void;
}

interface CreateDonationInput {
  amount: number;
  currency: string;
  appealId: string | null | undefined;
  appealAmount: number | null | undefined;
  donationDate: string;
  donorAccountNumber: string;
  designationAccountNumber: string;
  motivation: string | null | undefined;
  memo: string | null | undefined;
}

const donationSchema: yup.SchemaOf<CreateDonationInput> = yup.object({
  amount: yup.number().required(),
  currency: yup.string().required(),
  appealId: yup.string().nullable(),
  appealAmount: yup.number().nullable(),
  donationDate: yup.string().required(),
  donorAccountNumber: yup.string().required(),
  designationAccountNumber: yup.string().required(),
  motivation: yup.string().nullable(),
  memo: yup.string().nullable(),
});

const CreateDonationModal: React.FC<Props> = ({}) => {
  const initialDonation: CreateDonationInput = {
    amount: 0,
    currency: '',
    appealId: null,
    appealAmount: null,
    donationDate: '',
    donorAccountNumber: '',
    designationAccountNumber: '',
    motivation: null,
    memo: null,
  };

  const onSubmit = () => {
    //TODO: Submit Method
  };

  return (
    <Formik
      initialValues={initialDonation}
      validationSchema={donationSchema}
      onSubmit={onSubmit}
    ></Formik>
  );
};

export default CreateDonationModal;
