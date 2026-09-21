export interface InventoryItem {
  _id?: string;
  name: string;
  quantity: number;
  description: string;
  isEquipped: boolean;
  isPublic: boolean;
}

export interface Money {
  pc: number; // Cobre
  pp: number; // Plata
  pe: number; // Electro
  po: number; // Oro
  ppt: number; // Platino
}

export interface Character {
  _id?: string;
  name: string;
  race: string;
  class: string;
  level: number;
  avatar_url?: string;
  user_id: any; 
  campaign_id: any; 
  
  public_money: Money;   
  private_money: Money;  

  inventory: InventoryItem[];
  createdAt?: string;
  updatedAt?: string;
}
