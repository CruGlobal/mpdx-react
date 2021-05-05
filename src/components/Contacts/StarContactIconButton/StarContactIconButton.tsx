import { Button, styled } from '@material-ui/core';
import React from 'react';
import { StarBorderOutlined } from '@material-ui/icons';
import StarIcon from '@material-ui/icons/Star';
import { useSetContactStarredMutation } from './SetContactStarred.generated';

interface Props {
  accountListId: string;
  contactId: string;
  hasStar: boolean;
}

const StarButton = styled(Button)(({}) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StarFilled = styled(StarIcon)(({ theme }) => ({
  width: '24px',
  height: '24px',
  color: theme.palette.primary.dark,
}));

const StarOutline = styled(StarBorderOutlined)(({ theme }) => ({
  width: '24px',
  height: '24px',
  color: theme.palette.secondary.dark,
}));

export const StarContactIconButton: React.FC<Props> = ({
  accountListId,
  contactId,
  //hasStar = false,
}) => {
  //const [starred, setStarred] = useState(hasStar);

  const [setContactStarred, { data }] = useSetContactStarredMutation();

  const starred = data?.updateContact?.contact.noAppeals || false;

  const toggleStarred = async () => {
    setContactStarred({
      variables: { accountListId, contactId, starred: !starred },
    });
  };

  return (
    <StarButton onClick={toggleStarred}>
      {starred ? <StarFilled /> : <StarOutline />}
    </StarButton>
  );
};
