import { supabase } from './supabase';
import type { Meeting, Vote, TimeSlot } from '../models/Meeting';

const USER_NAME_KEY = 'vermuteo_user_name';

export const meetingStorage = {
    // Create a new meeting in Supabase
    createMeeting: async (title: string, dates: string[]): Promise<Meeting | null> => {
        const id = crypto.randomUUID();
        const newMeeting: Meeting = { id, title, dates, votes: [] };

        const { error } = await supabase
            .from('meetings')
            .insert([{ id, data: newMeeting }]);

        if (error) {
            console.error('Erro ao crear o encontro en Supabase:', error);
            return null;
        }

        return newMeeting;
    },

    // Get a meeting from Supabase by ID
    getMeeting: async (id: string): Promise<Meeting | undefined> => {
        const { data, error } = await supabase
            .from('meetings')
            .select('data')
            .eq('id', id)
            .single();

        if (error || !data) {
            console.error('Erro ao obter o encontro:', error);
            return undefined;
        }

        return data.data as Meeting;
    },

    // Save a vote to Supabase
    saveVote: async (meetingId: string, userName: string, slots: TimeSlot[]) => {
        // 1. Get current meeting data
        const meeting = await meetingStorage.getMeeting(meetingId);
        if (!meeting) return;

        // 2. Update votes array
        const updatedVotes = (meeting.votes || []).filter(v => v.userName !== userName);
        updatedVotes.push({
            userName,
            slots,
            votedAt: new Date().toISOString()
        });

        const updatedMeeting = { ...meeting, votes: updatedVotes };

        // 3. Update in Supabase
        const { error } = await supabase
            .from('meetings')
            .update({ data: updatedMeeting })
            .eq('id', meetingId);

        if (error) {
            console.error('Erro ao gardar o voto:', error);
            return;
        }

        // Remember user name locally
        localStorage.setItem(USER_NAME_KEY, userName);
    },

    getUserName: (): string | null => {
        return localStorage.getItem(USER_NAME_KEY);
    },

    // These are now helpers that work with the data already fetched in the component
    getSlotVoteCount: (meeting: Meeting, day: string, hour: number): number => {
        const votes = meeting.votes || [];
        return votes.filter(vote =>
            vote.slots.some(slot => slot.day === day && slot.hour === hour)
        ).length;
    }
};
