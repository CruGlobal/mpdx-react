import { initialFilterFromPath } from '../../../../pages/accountLists/[accountListId]/tasks';

describe('tasks', () => {
    describe('initialFilterFromPath', () => {
        it('returns completed', () => {
            expect(initialFilterFromPath('/tasks?completed=true')).toEqual({ completed: true });
        });
        it('returns wildcardSearch', () => {
            expect(initialFilterFromPath('/tasks?wildcardSearch=true+words')).toEqual({ wildcardSearch: 'true words' });
        });
        it('returns startAt[max]', () => {
            expect(initialFilterFromPath('/tasks?startAt[max]=2020-10-19')).toEqual({
                startAt: { max: '2020-10-19' },
            });
        });

        it('returns startAt[min]', () => {
            expect(initialFilterFromPath('/tasks?startAt[min]=2020-10-19')).toEqual({
                startAt: { min: '2020-10-19' },
            });
        });

        it('returns startAt[max] and startAt[min]', () => {
            expect(initialFilterFromPath('/tasks?startAt[min]=2020-05-19&startAt[max]=2020-10-19')).toEqual({
                startAt: { min: '2020-05-19', max: '2020-10-19' },
            });
        });

        it('returns userIds', () => {
            expect(initialFilterFromPath('/tasks?userIds[]=abc&userIds[]=def')).toEqual({
                userIds: ['abc', 'def'],
            });
        });

        it('returns tags', () => {
            expect(initialFilterFromPath('/tasks?tags[]=abc&tags[]=def')).toEqual({
                tags: ['abc', 'def'],
            });
        });

        it('returns contactIds', () => {
            expect(initialFilterFromPath('/tasks?contactIds[]=abc&contactIds[]=def')).toEqual({
                contactIds: ['abc', 'def'],
            });
        });

        it('returns activityType', () => {
            expect(
                initialFilterFromPath('/tasks?activityType[]=PARTNER_FINANCIAL&activityType[]=PARTNER_PRAYER'),
            ).toEqual({
                activityType: ['PARTNER_FINANCIAL', 'PARTNER_PRAYER'],
            });
        });
    });
});
