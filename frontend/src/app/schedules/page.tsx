'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ScheduleService } from '@/services/schedule.service';
import { AvailabilitySlot } from '@/types/schedule';
import { useAppContext } from '@/context/app-context';

export default function SchedulesPage() {
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const { professionalId } = useAppContext();

  const fetchSlots = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await ScheduleService.getDaySchedule(professionalId, date);
      setSlots(data.entries);
    } catch (error) {
      console.error('Failed to fetch slots:', error);
    } finally {
      setIsLoading(false);
    }
  }, [professionalId, date]);

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Schedules</h1>
          <p className="text-gray-500 text-sm">Manage your availability and view upcoming slots.</p>
        </div>
        <div className="flex items-center space-x-4">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none"
          />
          <button 
            onClick={() => fetchSlots()}
            className="bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 transition-colors"
          >
            🔄 Refresh
          </button>
          <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            + New Slot
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Time</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan={3} className="px-6 py-10 text-center text-gray-500 italic">Loading slots...</td>
              </tr>
            ) : slots.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-10 text-center text-gray-500 italic">No slots found for this date.</td>
              </tr>
            ) : (
              slots.map((slot) => (
                <tr key={slot.slot_id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-gray-800">
                      {slot.start_time.substring(0, 5)} - {slot.end_time.substring(0, 5)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      slot.status === 'available' ? 'bg-green-50 text-green-700 border-green-100' :
                      slot.status === 'booked' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                      'bg-gray-50 text-gray-700 border-gray-100'
                    }`}>
                      {slot.status.charAt(0).toUpperCase() + slot.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-gray-400 hover:text-gray-600 text-sm font-medium mr-4">Edit</button>
                    <button className="text-red-400 hover:text-red-600 text-sm font-medium">Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
