import { API_BASE_URL } from "@/lib/constants";
import { AvailabilitySlot, AvailabilitySlotCreate, AvailabilitySlotUpdate } from "@/types/schedule";

export class ScheduleService {
  static async getDaySchedule(professionalId: string, date: string): Promise<{ date: string, entries: AvailabilitySlot[] }> {
    const response = await fetch(`${API_BASE_URL}/schedule/day?professional_id=${professionalId}&date=${date}`);
    if (!response.ok) throw new Error('Failed to fetch schedule');
    return response.json();
  }

  static async createSlot(slot: AvailabilitySlotCreate): Promise<{ status: string, data: AvailabilitySlot }> {
    const response = await fetch(`${API_BASE_URL}/schedule/slots`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(slot),
    });
    if (!response.ok) throw new Error('Failed to create slot');
    return response.json();
  }

  static async updateSlot(slotId: string, update: AvailabilitySlotUpdate): Promise<{ status: string, data: AvailabilitySlot }> {
    const response = await fetch(`${API_BASE_URL}/schedule/slots/${slotId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(update),
    });
    if (!response.ok) throw new Error('Failed to update slot');
    return response.json();
  }

  static async deleteSlot(slotId: string): Promise<{ status: string, message: string }> {
    const response = await fetch(`${API_BASE_URL}/schedule/slots/${slotId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete slot');
    return response.json();
  }
}
