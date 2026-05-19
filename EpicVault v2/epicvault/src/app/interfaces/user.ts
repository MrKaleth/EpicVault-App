export interface User {
    _id?: string;       
    username: string;
    email: string;
    password_hash: string;
    verified?: boolean;  
    avatar_url?: string;
    global_roles?: string[];

    friend_code?: string;
    friends?: string[];
    friend_requests?: string[];  
    sent_friend_requests?: string[]; 

    created_at?: Date;
    last_login?: Date;
    campaigns?: any[]; 
}