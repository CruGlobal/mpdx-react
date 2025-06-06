import { useRouter } from 'next/router';
import React, { useCallback, useEffect, useState } from 'react';
import { TabKey } from './ContactDetails';
import { DonationTabKey } from './ContactDonationsTab/DonationTabKey';

export type ContactDetailsType = {
  selectedTabKey: TabKey;
  setSelectedTabKey: React.Dispatch<React.SetStateAction<TabKey>>;
  handleTabChange: (event: React.SyntheticEvent, newKey: TabKey) => void;
  editModalOpen: boolean;
  setEditModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  editOtherModalOpen: boolean;
  setEditOtherModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  editMailingModalOpen: boolean;
  setEditMailingModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  editingAddressId: string | undefined;
  setEditingAddressId: React.Dispatch<React.SetStateAction<string | undefined>>;
  addAddressModalOpen: boolean;
  setAddAddressModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  editPersonModalOpen: string | undefined;
  openPersonModal: (id: string) => void;
  closePersonModal: () => void;
  createPersonModalOpen: boolean;
  setCreatePersonModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  selectedDonationTabKey: DonationTabKey;
  setSelectedDonationTabKey: React.Dispatch<
    React.SetStateAction<DonationTabKey>
  >;
  notes: string;
  setNotes: React.Dispatch<React.SetStateAction<string>>;
  referralsModalOpen: boolean;
  setReferralsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  deleteModalOpen: boolean;
  setDeleteModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  anchorEl: (EventTarget & HTMLButtonElement) | undefined;
  setAnchorEl: React.Dispatch<
    React.SetStateAction<(EventTarget & HTMLButtonElement) | undefined>
  >;
};

export const ContactDetailContext =
  React.createContext<ContactDetailsType | null>(null);

interface Props {
  children?: React.ReactNode;
}

export const ContactDetailProvider: React.FC<Props> = ({ children }) => {
  const router = useRouter();
  const query = router?.query;
  const [editingAddressId, setEditingAddressId] = useState<string>();
  const [addAddressModalOpen, setAddAddressModalOpen] = useState(false);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editOtherModalOpen, setEditOtherModalOpen] = useState(false);
  const [editMailingModalOpen, setEditMailingModalOpen] = useState(false);
  const [selectedTabKey, setSelectedTabKey] = React.useState(
    query?.tab ? TabKey[query.tab.toString()] ?? TabKey.Tasks : TabKey.Tasks,
  );
  const handleTabChange = (_event: React.SyntheticEvent, newKey: TabKey) => {
    setSelectedTabKey(newKey);
  };

  const [editPersonModalOpen, setEditPersonModalOpen] = useState<string>();
  const [createPersonModalOpen, setCreatePersonModalOpen] = useState(false);

  const [selectedDonationTabKey, setSelectedDonationTabKey] = React.useState(
    DonationTabKey.Donations,
  );
  const [notes, setNotes] = useState('');

  const [referralsModalOpen, setReferralsModalOpen] = useState(false);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const [anchorEl, setAnchorEl] = useState<EventTarget & HTMLButtonElement>();

  useEffect(() => {
    const personId = router.query.personId as string;
    if (personId) {
      setSelectedTabKey(TabKey.ContactDetails);
      setEditPersonModalOpen(personId);
    }
  }, [router.query.personId]);

  useEffect(() => {
    if (!router.query.personId && editPersonModalOpen) {
      setEditPersonModalOpen(undefined);
    }
  }, [router.query.personId]);

  const openPersonModal = useCallback(
    (id: string) => {
      router.replace(
        { pathname: router.pathname, query: { ...router.query, personId: id } },
        undefined,
        { shallow: true },
      );
      setEditPersonModalOpen(id);
    },
    [router],
  );

  const closePersonModal = useCallback(() => {
    const { personId: _, ...rest } = router.query;
    router.replace({ pathname: router.pathname, query: rest }, undefined, {
      shallow: true,
    });
    setEditPersonModalOpen(undefined);
  }, [router]);

  return (
    <ContactDetailContext.Provider
      value={{
        editingAddressId: editingAddressId,
        setEditingAddressId: setEditingAddressId,
        addAddressModalOpen: addAddressModalOpen,
        setAddAddressModalOpen: setAddAddressModalOpen,
        editModalOpen: editModalOpen,
        setEditModalOpen: setEditModalOpen,
        editOtherModalOpen: editOtherModalOpen,
        setEditOtherModalOpen: setEditOtherModalOpen,
        editMailingModalOpen: editMailingModalOpen,
        setEditMailingModalOpen: setEditMailingModalOpen,
        selectedTabKey: selectedTabKey,
        setSelectedTabKey: setSelectedTabKey,
        handleTabChange: handleTabChange,
        editPersonModalOpen: editPersonModalOpen,
        openPersonModal,
        closePersonModal,
        createPersonModalOpen: createPersonModalOpen,
        setCreatePersonModalOpen: setCreatePersonModalOpen,
        selectedDonationTabKey: selectedDonationTabKey,
        setSelectedDonationTabKey: setSelectedDonationTabKey,
        notes: notes,
        setNotes: setNotes,
        referralsModalOpen: referralsModalOpen,
        setReferralsModalOpen: setReferralsModalOpen,
        deleteModalOpen: deleteModalOpen,
        setDeleteModalOpen: setDeleteModalOpen,
        anchorEl: anchorEl,
        setAnchorEl: setAnchorEl,
      }}
    >
      {children}
    </ContactDetailContext.Provider>
  );
};
