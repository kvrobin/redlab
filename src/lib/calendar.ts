import { Meeting, MeetingSlot } from '@/types';

/**
 * Formats a Date object or ISO string to UTC format for Google Calendar and iCalendar:
 * e.g., "20261021T140000Z"
 */
export function formatToUtcCompact(dateInput: string | Date): string {
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) {
    return new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  }
  return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

/**
 * Generates a one-click Google Calendar creation URL.
 */
export function generateGoogleCalendarUrl(meeting: Meeting, slot: MeetingSlot): string {
  const startUtc = formatToUtcCompact(slot.start_time);
  const endUtc = formatToUtcCompact(
    slot.end_time ||
      new Date(new Date(slot.start_time).getTime() + (meeting.duration_minutes || 45) * 60000).toISOString()
  );

  const title = encodeURIComponent(`[RED Lab] ${meeting.title}`);
  const details = encodeURIComponent(
    `${meeting.description || 'RED Lab kutatócsoporti konzultáció'}\n\nNapirend:\n${(
      meeting.agenda_items || []
    )
      .map((item, idx) => `${idx + 1}. ${item}`)
      .join('\n')}\n\nRED Lab Béta Platform`
  );
  const location = encodeURIComponent(meeting.location_or_link || 'Google Meet / RED Lab');

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startUtc}/${endUtc}&details=${details}&location=${location}`;
}

/**
 * Generates RFC 5545 compliant iCalendar (.ics) string.
 */
export function generateIcsContent(meeting: Meeting, slot: MeetingSlot): string {
  const startUtc = formatToUtcCompact(slot.start_time);
  const endUtc = formatToUtcCompact(
    slot.end_time ||
      new Date(new Date(slot.start_time).getTime() + (meeting.duration_minutes || 45) * 60000).toISOString()
  );
  const nowUtc = formatToUtcCompact(new Date());

  const summary = `[RED Lab] ${meeting.title}`.replace(/,/g, '\\,').replace(/;/g, '\\;');
  const description = (
    `${meeting.description || 'RED Lab kutatócsoporti konzultáció'}\\n\\nNapirendi pontok:\\n` +
    (meeting.agenda_items || []).map((it, i) => `${i + 1}. ${it}`).join('\\n') +
    `\\n\\nHelyszín / Link: ${meeting.location_or_link || 'Online'}`
  )
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');
  const location = (meeting.location_or_link || 'RED Lab Virtual Room')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');

  const uid = `meet-${meeting.id}-${slot.id}@redlab.research`;

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//RED Lab//Research Group Collaboration Platform//HU',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${nowUtc}`,
    `DTSTART:${startUtc}`,
    `DTEND:${endUtc}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${location}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

/**
 * Downloads a .ics file directly in the user's browser.
 */
export function downloadIcsFile(meeting: Meeting, slot: MeetingSlot): void {
  const icsString = generateIcsContent(meeting, slot);
  const blob = new Blob([icsString], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const cleanFileName = `RED_Lab_${meeting.title.replace(/[^a-zA-Z0-9_-]/g, '_')}.ics`;

  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', cleanFileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
