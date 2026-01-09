import type { Meeting, Vote, TimeSlot } from '../models/Meeting';

const MEETING_KEY = 'vermuteo_meetings';
const USER_NAME_KEY = 'vermuteo_user_name';

export const meetingStorage = {
    createMeeting: (title: string, dates: string[]): Meeting => {
        const id = crypto.randomUUID();
        const newMeeting: Meeting = { id, title, dates, votes: [] };

        const stored = localStorage.getItem(MEETING_KEY);
        const meetings: Meeting[] = stored ? JSON.parse(stored) : [];
        meetings.push(newMeeting);
        localStorage.setItem(MEETING_KEY, JSON.stringify(meetings));

        return newMeeting;
    },

    getMeeting: (id: string): Meeting | undefined => {
        const stored = localStorage.getItem(MEETING_KEY);
        if (!stored) return undefined;
        const meetings: Meeting[] = JSON.parse(stored);
        return meetings.find(m => m.id === id);
    },

    saveVote: (meetingId: string, userName: string, slots: TimeSlot[]) => {
        const stored = localStorage.getItem(MEETING_KEY);
        if (!stored) return;

        const meetings: Meeting[] = JSON.parse(stored);
        const meeting = meetings.find(m => m.id === meetingId);

        if (!meeting) return;

        // Remove previous vote from this user if exists
        meeting.votes = meeting.votes.filter(v => v.userName !== userName);

        // Add new vote
        const newVote: Vote = {
            userName,
            slots,
            votedAt: new Date().toISOString()
        };
        meeting.votes.push(newVote);

        // Save back
        localStorage.setItem(MEETING_KEY, JSON.stringify(meetings));

        // Remember user name for this browser
        localStorage.setItem(USER_NAME_KEY, userName);
    },

    getUserName: (): string | null => {
        return localStorage.getItem(USER_NAME_KEY);
    },

    getMyVote: (meetingId: string): Vote | undefined => {
        const userName = meetingStorage.getUserName();
        if (!userName) return undefined;

        const meeting = meetingStorage.getMeeting(meetingId);
        if (!meeting) return undefined;

        return meeting.votes.find(v => v.userName === userName);
    },

    getAllVotes: (meetingId: string): Vote[] => {
        const meeting = meetingStorage.getMeeting(meetingId);
        return meeting?.votes || [];
    },

    // Get vote count for a specific slot
    getSlotVoteCount: (meetingId: string, day: string, hour: number): number => {
        const votes = meetingStorage.getAllVotes(meetingId);
        return votes.filter(vote =>
            vote.slots.some(slot => slot.day === day && slot.hour === hour)
        ).length;
    }
};
