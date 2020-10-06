import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'next-auth/jwt';

const handoff = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    const jwtToken = await jwt.getToken({ req, secret: process.env.JWT_SECRET });
    if (jwtToken && req.query.accountListId && req.query.userId && req.query.path) {
        const url = new URL(
            `https://${process.env.SITE_URL === 'https://next.mpdx.org' ? '' : 'stage.'}mpdx.org/handoff`,
        );

        url.searchParams.append('accessToken', jwtToken['token']);
        url.searchParams.append('accountListId', req.query.accountListId.toString());
        url.searchParams.append('userId', req.query.userId.toString());
        url.searchParams.append('path', req.query.path.toString());
        res.redirect(url.href);
    } else {
        res.status(422);
    }
};

export default handoff;
