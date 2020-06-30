import { useEffect } from 'react';
import router from 'next/router';
import { useQuery, gql } from '@apollo/client';
import { GetUserQuery } from '../../types/GetUserQuery';

const GET_USER = gql`
    query GetUserQuery {
        user {
            id
            firstName
            lastName
        }
    }
`;

interface UseUserOptions {
    redirectTo?: string;
    redirectIfFound?: boolean;
}

const useUser = ({ redirectTo, redirectIfFound }: UseUserOptions): GetUserQuery => {
    const { data, error } = useQuery(GET_USER);
    const user = data?.user;
    const finished = Boolean(data || error);
    const hasUser = Boolean(user);

    useEffect(() => {
        if (!redirectTo || !finished) return;
        if (
            // If redirectTo is set, redirect if the user was not found.
            (redirectTo && !redirectIfFound && !hasUser) ||
            // If redirectIfFound is also set, redirect if the user was found
            (redirectIfFound && hasUser)
        ) {
            router.push(redirectTo);
        }
    }, [redirectTo, redirectIfFound, finished, hasUser]);

    return error ? null : user;
};
export default useUser;
