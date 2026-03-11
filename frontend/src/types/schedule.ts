export type SlotStatus = 'available' | 'booked' | 'blocked' | 'cancelled';

export interface AvailabilitySlot {
  slot_id: string;
  professional_id: string;
  date: string; // YYYY-MM-DD
  start_time: string; // HH:MM:SS
  end_time: string; // HH:MM:SS
  status: SlotStatus;
  created_at?: string;
  updated_at?: string;
}

export interface AvailabilitySlotCreate {
  professional_id: string;
  date: string;
  start_time: string;
  end_time: string;
}

export interface AvailabilitySlotUpdate {
  date?: string;
  start_time?: string;
  end_time?: string;
  status?: SlotStatus;
}
