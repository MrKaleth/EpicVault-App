export interface Note {
  _id?: string;
  title: string;
  content: string;
  author_id: any; 
  campaign_id: any;
  isPublic: boolean;
  createdAt?: string;
  updatedAt?: string;
}