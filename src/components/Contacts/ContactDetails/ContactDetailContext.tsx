import React, { useState } from 'react';
import { TabKey } from './ContactDetails';
import { DonationTabKey } from './ContactDontationsTab/ContactDonationsTab';

export type ContactDetailsType = {
  selectedTabKey: TabKey;
  setSelectedTabKey: React.Dispatch<React.SetStateAction<TabKey>>;
  handleTabChange: (
    event: React.ChangeEvent<Record<string, unknown>>,
    newKey: TabKey,
  ) => void;
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
  personEditShowMore: boolean;
  setPersonEditShowMore: React.Dispatch<React.SetStateAction<boolean>>;
  removeDialogOpen: boolean;
  handleRemoveDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  editPersonModalOpen: string | undefined;
  setEditPersonModalOpen: React.Dispatch<
    React.SetStateAction<string | undefined>
  >;
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
  const [editingAddressId, setEditingAddressId] = useState<string>();
  const [addAddressModalOpen, setAddAddressModalOpen] = useState(false);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editOtherModalOpen, setEditOtherModalOpen] = useState(false);
  const [editMailingModalOpen, setEditMailingModalOpen] = useState(false);
  const [selectedTabKey, setSelectedTabKey] = React.useState(TabKey.Tasks);
  const handleTabChange = (
    _event: React.ChangeEvent<Record<string, unknown>>,
    newKey: TabKey,
  ) => {
    setSelectedTabKey(newKey);
  };

  const [personEditShowMore, setPersonEditShowMore] = useState(false);
  const [removeDialogOpen, handleRemoveDialogOpen] = useState(false);

  const [editPersonModalOpen, setEditPersonModalOpen] = useState<string>();
  const [createPersonModalOpen, setCreatePersonModalOpen] = useState(false);

  const [selectedDonationTabKey, setSelectedDonationTabKey] = React.useState(
    DonationTabKey.Donations,
  );
  const [notes, setNotes] = useState('');

  const [referralsModalOpen, setReferralsModalOpen] = useState(false);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const [anchorEl, setAnchorEl] = useState<EventTarget & HTMLButtonElement>();

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
        personEditShowMore: personEditShowMore,
        setPersonEditShowMore: setPersonEditShowMore,
        removeDialogOpen: removeDialogOpen,
        handleRemoveDialogOpen: handleRemoveDialogOpen,
        editPersonModalOpen: editPersonModalOpen,
        setEditPersonModalOpen: setEditPersonModalOpen,
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
