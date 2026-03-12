'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ScheduleService } from '@/services/schedule.service';
import { AvailabilitySlot } from '@/types/schedule';
import { Booking } from '@/types/booking';
import { useAppContext } from '@/context/app-context';

type SlotWithBookings = AvailabilitySlot & { bookings?: (Booking & { clients?: { client_name: string } })[] };

const STATUS_CONFIG: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  available:  { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-400', label: 'Available'  },
  booked:     { bg: 'bg-blue-50',    text: 'text-blue-700',    dot: 'bg-blue-400',    label: 'Booked'     },
  blocked:    { bg: 'bg-amber-50',   text: 'text-amber-700',   dot: 'bg-amber-400',   label: 'Blocked'    },
  cancelled:  { bg: 'bg-red-50',     text: 'text-red-600',     dot: 'bg-red-400',     label: 'Cancelled'  },
};

const fmt = (t: string) => t.substring(0, 5);

const todayISO = () => new Date().toISOString().split('T')[0];

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const getWeekStart = (isoDate: string) => {
  const date = new Date(isoDate);
  const day = date.getDay(); // 0 = Sun, 1 = Mon ...
  const diffToMonday = (day === 0 ? -6 : 1) - day;
  const monday = new Date(date);
  monday.setDate(date.getDate() + diffToMonday);
  return monday.toISOString().split('T')[0];
};

const addDays = (isoDate: string, days: number) => {
  const d = new Date(isoDate);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
};

const displayShort = (iso: string) => {
  const [_, m, d] = iso.split('-');
  return `${d}/${m}`;
};

const displayRange = (startIso: string) => {
  const start = new Date(startIso);
  const end = new Date(startIso);
  end.setDate(end.getDate() + 6);
  const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
  return `${start.toLocaleDateString(undefined, opts)} – ${end.toLocaleDateString(undefined, opts)}`;
};

export default function SchedulesPage() {
  const { professionalId } = useAppContext();

  const [anchorDate, setAnchorDate] = useState(todayISO);
  const [weekData, setWeekData] = useState<Record<string, SlotWithBookings[]>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const weekStart = useMemo(() => getWeekStart(anchorDate), [anchorDate]);
  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  );

  const fetchWeek = useCallback(async () => {
    if (!professionalId) return;
    setIsLoading(true);
    try {
      const results = await Promise.all(
        weekDays.map(async (date) => {
          const data = await ScheduleService.getDaySchedule(professionalId, date);
          return { date, entries: (data.entries ?? []) as SlotWithBookings[] };
        })
      );
      const byDate: Record<string, SlotWithBookings[]> = {};
      results.forEach((r) => {
        byDate[r.date] = r.entries;
      });
      setWeekData(byDate);
    } catch (err) {
      console.error('Failed to fetch weekly schedule:', err);
      setWeekData({});
    } finally {
      setIsLoading(false);
    }
  }, [professionalId, weekDays]);

  useEffect(() => {
    fetchWeek();
  }, [fetchWeek]);

  const openDaysCount = weekDays.reduce((acc, d) => {
    const daySlots = weekData[d] ?? [];
    const hasAvailable = daySlots.some((s) => s.status === 'available');
    return acc + (hasAvailable ? 1 : 0);
  }, 0);

  const bookedCount = weekDays.reduce((acc, d) => {
    const daySlots = weekData[d] ?? [];
    return acc + daySlots.filter((s) => s.status === 'booked').length;
  }, 0);

  const selectedBookings =
    selectedDate && weekData[selectedDate]
      ? (weekData[selectedDate]
          .flatMap((slot) =>
            (slot.bookings as SlotWithBookings['bookings']) ?? []
          )
          .filter((b) => b.status === 'scheduled' || b.status === 'rescheduled')
          .sort((a, b) =>
            a.start_time.localeCompare(b.start_time)
          )) as Booking[]
      : [];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Weekly schedule</h1>
            <p className="text-sm text-gray-500 mt-1">
              View open slots from Monday to Sunday and drill into bookings for a specific day.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-white rounded-xl border border-gray-200 shadow-sm">
              <button
                onClick={() => setAnchorDate(addDays(weekStart, -7))}
                className="px-3 py-2 text-gray-500 hover:text-gray-800 hover:bg-gray-50 rounded-l-xl"
              >
                ‹
              </button>
              <div className="px-4 py-2 text-sm font-medium text-gray-800 border-x border-gray-100">
                {displayRange(weekStart)}
              </div>
              <button
                onClick={() => setAnchorDate(addDays(weekStart, 7))}
                className="px-3 py-2 text-gray-500 hover:text-gray-800 hover:bg-gray-50 rounded-r-xl"
              >
                ›
              </button>
            </div>
            <button
              onClick={() => setAnchorDate(todayISO())}
              className="text-xs font-semibold text-green-600 hover:text-green-700 px-3 py-2 rounded-lg hover:bg-green-50"
            >
              Today
            </button>
          </div>
        </div>

        {!isLoading && (
          <div className="flex gap-3 mb-5">
            <div className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 shadow-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-gray-400 inline-block" />
              <span className="text-sm text-gray-600 font-medium">
                {openDaysCount} day{openDaysCount === 1 ? '' : 's'} with open slots
              </span>
            </div>
            {bookedCount > 0 && (
              <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-2.5 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />
                <span className="text-sm text-blue-700 font-medium">
                  {bookedCount} booked slot{bookedCount === 1 ? '' : 's'} this week
                </span>
              </div>
            )}
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
          {isLoading ? (
            <div className="flex justify-center items-center py-16">
              <div className="flex space-x-2">
                <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce [animation-delay:120ms]" />
                <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce [animation-delay:240ms]" />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-3">
              {weekDays.map((dateIso, index) => {
                const daySlots = weekData[dateIso] ?? [];
                const available = daySlots.filter((s) => s.status === 'available');
                const booked = daySlots.filter((s) => s.status === 'booked');
                const hasAnything = daySlots.length > 0;
                const isToday = dateIso === todayISO();

                return (
                  <button
                    key={dateIso}
                    type="button"
                    onClick={() => hasAnything && setSelectedDate(dateIso)}
                    className={`flex flex-col rounded-xl border text-left px-3 py-2.5 min-h-[120px] transition-all ${
                      hasAnything
                        ? 'bg-slate-900/95 border-slate-800 hover:border-emerald-400 hover:shadow-lg hover:shadow-emerald-500/10'
                        : 'bg-gray-50 border-dashed border-gray-200 hover:border-gray-300'
                    } ${hasAnything ? 'cursor-pointer' : 'cursor-default'}`}
                  >
                    <div className="flex items-baseline justify-between mb-2">
                      <div className="flex flex-col">
                        <span
                          className={`text-xs font-semibold tracking-wide uppercase ${
                            hasAnything ? 'text-slate-200' : 'text-gray-400'
                          }`}
                        >
                          {WEEKDAYS[index]}
                        </span>
                        <span
                          className={`text-sm font-semibold ${
                            hasAnything ? 'text-white' : 'text-gray-700'
                          }`}
                        >
                          {displayShort(dateIso)}
                        </span>
                      </div>
                      {isToday && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400">
                          Today
                        </span>
                      )}
                    </div>

                    {hasAnything ? (
                      <div className="mt-1 space-y-1.5">
                        {available.slice(0, 3).map((slot) => (
                          <div
                            key={slot.slot_id}
                            className="flex items-center justify-between rounded-lg bg-slate-800/80 px-2 py-1 text-[11px]"
                          >
                            <span className="font-mono text-slate-100">
                              {fmt(slot.start_time)}–{fmt(slot.end_time)}
                            </span>
                            <span className="inline-flex items-center gap-1 text-emerald-300">
                              <span className="w-1 h-1 rounded-full bg-emerald-400" />
                              Open
                            </span>
                          </div>
                        ))}
                        {available.length > 3 && (
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            +{available.length - 3} more open slot
                            {available.length - 3 === 1 ? '' : 's'}
                          </p>
                        )}
                        {booked.length > 0 && (
                          <p className="text-[10px] text-blue-200/90 mt-1">
                            {booked.length} booked slot{booked.length === 1 ? '' : 's'}
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="mt-4 text-[11px] text-gray-400">
                        No slots
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {selectedDate && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 max-h-[80vh] flex flex-col">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-gray-900">
                    Bookings for {selectedDate}
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Client name, time, note and created date.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedDate(null)}
                  className="text-gray-400 hover:text-gray-700 rounded-full p-1 hover:bg-gray-100"
                >
                  ×
                </button>
              </div>
              <div className="px-6 py-4 overflow-y-auto">
                {selectedBookings.length === 0 ? (
                  <p className="text-sm text-gray-400">
                    No bookings for this day yet.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {selectedBookings.map((booking) => (
                      <div
                        key={booking.booking_id}
                        className="border border-gray-100 rounded-xl p-3 bg-gray-50"
                      >
                        <div className="flex items-baseline justify-between">
                          <span className="text-sm font-semibold text-gray-900">
                            {booking.clients?.client_name ?? 'Unknown client'}
                          </span>
                          <span className="text-xs font-mono text-gray-500">
                            {fmt(booking.start_time)}–{fmt(booking.end_time)}
                          </span>
                        </div>
                        {booking.booking_note && (
                          <p className="mt-1 text-xs text-gray-600">
                            {booking.booking_note}
                          </p>
                        )}
                        {booking.created_at && (
                          <p className="mt-1 text-[10px] text-gray-400">
                            Created at{' '}
                            {new Date(booking.created_at).toLocaleString()}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="px-6 py-3 border-t border-gray-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedDate(null)}
                  className="text-xs font-semibold text-gray-600 hover:text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-100"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}