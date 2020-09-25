import { NextApiRequest, NextApiResponse } from 'next';
import Axios from 'axios';
import jwt from 'next-auth/jwt';

const graphql = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    const jwtToken = await jwt.getToken({ req, secret: process.env.JWT_SECRET });
    const response = await Axios.post(process.env.API_URL, req.body, {
        headers: {
            Authorization: jwtToken ? `Bearer ${jwtToken.token}` : null,
            Accept: 'application/json',
        },
    });
    res.status(200).json(response.data);
};

export default graphql;
