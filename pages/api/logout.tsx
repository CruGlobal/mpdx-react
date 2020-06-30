import { NextApiRequest, NextApiResponse } from 'next';
import { removeTokenCookie } from '../../src/lib/cookies';

const logout = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    if (req.method == 'POST') {
        removeTokenCookie(res);
        res.status(200).send({});
    } else {
        res.status(401).send({});
    }
};

export default logout;
