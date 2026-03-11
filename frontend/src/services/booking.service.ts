import { API_BASE_URL } from "@/lib/constants";
import { Booking, BookingCreate, BookingUpdate } from "@/types/booking";

export class BookingService {
  static async createBooking(booking: BookingCreate): Promise<{ status: string, data: Booking }> {
    const response = await fetch(`${API_BASE_URL}/bookings/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(booking),
    });
    if (!response.ok) throw new Error('Failed to create booking');
    return response.json();
  }

  static async updateBooking(bookingId: string, update: BookingUpdate): Promise<{ status: string, data: Booking }> {
    const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(update),
    });
    if (!response.ok) throw new Error('Failed to update booking');
    return response.json();
  }

  static async cancelBooking(bookingId: string): Promise<{ status: string }> {
    const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to cancel booking');
    return response.json();
  }

  static async getUpcomingBookings(professionalId: string): Promise<{ professional_id: string, entries: Booking[] }> {
    const response = await fetch(`${API_BASE_URL}/bookings/upcoming/${professionalId}`);
    if (!response.ok) throw new Error('Failed to fetch upcoming bookings');
    return response.json();
  }
}
