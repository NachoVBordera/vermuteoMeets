export interface TimeSlot {
  day: string;   // YYYY-MM-DD
  hour: number; // 0-23
}

export interface Vote {
  userName: string;
  slots: TimeSlot[];
  votedAt: string; // ISO timestamp
}

export interface Meeting {
  id: string;
  title: string;
  dates: string[]; // YYYY-MM-DD selected by creator
  votes: Vote[]; // All votes from different users
}
