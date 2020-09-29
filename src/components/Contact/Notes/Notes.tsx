import React, { ReactElement, useEffect } from 'react';
import { TextField, Typography } from '@material-ui/core';
import { useLazyQuery, gql, useMutation } from '@apollo/client';
import * as yup from 'yup';
import { Formik } from 'formik';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { pick } from 'lodash/fp';
import { formatDistanceToNow } from 'date-fns';
import { ContactUpdateInput } from '../../../../types/globalTypes';
import { useApp } from '../../App';
import { GetContactForContactNotesQuery } from '../../../../types/GetContactForContactNotesQuery';
import Autosave from '../../Autosave';
import { UpdateContactNotesMutation } from '../../../../types/UpdateContactNotesMutation';

export const GET_CONTACT_FOR_CONTACT_NOTES_QUERY = gql`
    query GetContactForContactNotesQuery($accountListId: ID!, $contactId: ID!) {
        contact(accountListId: $accountListId, id: $contactId) {
            id
            notes
            updatedAt
        }
    }
`;

export const UPDATE_CONTACT_NOTES_MUTATION = gql`
    mutation UpdateContactNotesMutation($accountListId: ID!, $attributes: ContactUpdateInput!) {
        updateContact(input: { accountListId: $accountListId, attributes: $attributes }) {
            contact {
                id
                notes
                updatedAt
            }
        }
    }
`;

interface Props {
    contactId: string;
}
const contactSchema: yup.ObjectSchema<ContactUpdateInput> = yup.object({
    id: yup.string().required(),
    notes: yup.string().nullable(),
});

const ContactNotes = ({ contactId }: Props): ReactElement => {
    const { t } = useTranslation();
    const { state } = useApp();
    const { enqueueSnackbar } = useSnackbar();
    const [getContact, { data, loading }] = useLazyQuery<GetContactForContactNotesQuery>(
        GET_CONTACT_FOR_CONTACT_NOTES_QUERY,
    );
    const onLoad = async (): Promise<void> => {
        if (state.accountListId && contactId) {
            await getContact({ variables: { accountListId: state.accountListId, contactId } });
        }
    };

    useEffect(() => {
        onLoad();
    }, []);

    useEffect(() => {
        onLoad();
    }, [state.accountListId, contactId]);

    const [updateContact] = useMutation<UpdateContactNotesMutation>(UPDATE_CONTACT_NOTES_MUTATION);

    const onSubmit = async (attributes: ContactUpdateInput): Promise<void> => {
        try {
            await updateContact({
                variables: { accountListId: state.accountListId, attributes },
            });
            enqueueSnackbar(t('Notes saved successfully'), { variant: 'success' });
        } catch (error) {
            enqueueSnackbar(error.message, { variant: 'error' });
        }
    };

    const initialValues: ContactUpdateInput = data ? pick(['id', 'notes'], data.contact) : null;

    return (
        <>
            {!loading && data && (
                <Formik initialValues={initialValues} validationSchema={contactSchema} onSubmit={onSubmit}>
                    {({ values: { notes }, handleChange, handleSubmit }): ReactElement => (
                        <form onSubmit={handleSubmit} noValidate>
                            <Autosave />
                            <TextField
                                value={notes}
                                onChange={handleChange('notes')}
                                fullWidth
                                multiline
                                rowsMax={30}
                                variant="outlined"
                            />

                            <Typography color="textSecondary" variant="caption">
                                {formatDistanceToNow(new Date(data.contact.updatedAt), { addSuffix: true })}
                            </Typography>
                        </form>
                    )}
                </Formik>
            )}
        </>
    );
};

export default ContactNotes;
