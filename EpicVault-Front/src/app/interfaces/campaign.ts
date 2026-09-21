import { User } from './user'; 

export interface Campaign {
    _id?: string;
    name: string;
    description: string;
    cover_url?: string; 
    dungeon_master: string | any;
    players?: User[];
    status?: 'ACTIVE' | 'PAUSED' | 'COMPLETED';
    created_at?: string | Date;
}