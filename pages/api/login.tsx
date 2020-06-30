import Axios from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';
import { gql } from '@apollo/client';
import client from '../../src/lib/client';
import { setTokenCookie } from '../../src/lib/cookies';

const login = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    try {
        const {
            data: { ticket: ticket },
        } = await Axios.get(`${process.env.AUTH_URL}api/oauth/ticket`, {
            headers: {
                Authorization: `Bearer ${req.body.accessToken}`,
                Accept: 'application/json',
            },
            params: {
                service: `${process.env.API_URL}`,
            },
        });
        const response = await client.mutate({
            mutation: gql`
                mutation UserKeySignIn($casTicket: String) {
                    userKeySignIn(input: { casTicket: $casTicket }) {
                        token
                    }
                }
            `,
            variables: {
                casTicket: ticket,
            },
        });
        const token = response.data.userKeySignIn.token;
        setTokenCookie(res, token);
        res.status(200).send({ token });
    } catch (error) {
        res.status(401).send(error.message);
    }
};

export default login;
