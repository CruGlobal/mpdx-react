import { NextApiRequest, NextApiResponse } from 'next';
import Axios from 'axios';
import { gql } from '@apollo/client';
import client from '../../../src/lib/client';

export interface Profile {
  id: string;
  name: string;
  token: string;
}

const profile = async (
  req: NextApiRequest,
  res: NextApiResponse<Profile>,
): Promise<void> => {
  const {
    data: { ticket: ticket },
  } = await Axios.get('https://thekey.me/cas/api/oauth/ticket', {
    headers: {
      Authorization: req.headers.authorization,
      Accept: 'application/json',
    },
    params: {
      service: process.env.API_URL,
    },
  });

  const response = await client.mutate({
    mutation: gql`
      mutation UserKeySignIn($ticket: String!) {
        userKeySignIn(input: { casTicket: $ticket }) {
          token
          user {
            id
            name: firstName
          }
        }
      }
    `,
    variables: {
      ticket,
    },
  });
  const { user, token } = response.data.userKeySignIn;
  res.status(200).json({ ...user, token });
};

export default profile;
