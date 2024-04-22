import React, { ReactElement } from 'react';
import { Form, Formik } from 'formik';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { useCreateContactAddressMutation } from 'src/components/Contacts/ContactDetails/ContactDetailsTab/Mailing/AddAddressModal/CreateContactAddress.generated';
import { useSetContactPrimaryAddressMutation } from 'src/components/Contacts/ContactDetails/ContactDetailsTab/Mailing/SetPrimaryAddress.generated';
import { AddressFields } from 'src/components/Contacts/ContactDetails/ContactDetailsTab/Mailing/StreetAutocomplete/StreetAutocomplete';
import { useCreatePersonMutation } from 'src/components/Contacts/ContactDetails/ContactDetailsTab/People/Items/PersonModal/PersonModal.generated';
import { useCreateContactMutation } from '../CreateContact/CreateContact.generated';

interface Props {
  accountListId: string;
  handleClose: () => void;
  referredById?: string;
  rows?: number;
}

interface ContactRow {
  firstName: string;
  spouseName: string;
  lastName: string;
  address: AddressFields;
  phone: string;
  email: string;
}

interface ContactTable {
  contacts: ContactRow[];
}

const defaultContact: ContactRow = {
  firstName: '',
  spouseName: '',
  lastName: '',
  address: {
    street: '',
  },
  phone: '',
  email: '',
};

export const CreateMultipleContacts = ({
  accountListId,
  handleClose,
  referredById,
  rows = 10,
}: Props): ReactElement<Props> => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const initialContacts: ContactTable = {
    contacts: new Array(rows).fill(defaultContact),
  };

  const [createContact] = useCreateContactMutation();
  const [createPerson] = useCreatePersonMutation();
  const [createAddress] = useCreateContactAddressMutation();
  const [setPrimaryAddress] = useSetContactPrimaryAddressMutation();

  return (
    <Formik initialValues={initialContacts} validateOnChange={false}>
      {() => <Form></Form>}
    </Formik>
  );
};
