export type BookingStatus = 'scheduled' | 'rescheduled' | 'cancelled' | 'completed' | 'no_show';

export interface Booking {
  booking_id: string;
  professional_id: string;
  client_id: string;
  slot_id?: string;
  date: string;
  start_time: string;
  end_time: string;
  status: BookingStatus;
  booking_note?: string;
  created_at?: string;
  updated_at?: string;
  clients?: {
    client_name: string;
  };
}

export interface BookingCreate {
  professional_id: string;
  client_id: string;
  slot_id: string;
  date: string;
  start_time: string;
  end_time: string;
  booking_note?: string;
}

export interface BookingUpdate {
  client_id?: string;
  date?: string;
  time?: string;
  slot_id?: string;
  status?: BookingStatus;
  booking_note?: string;
}
