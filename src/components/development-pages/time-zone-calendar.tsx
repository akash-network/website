import { useState, useEffect } from 'react';

interface TimeZoneCalendarProps {
  calendarId: string
  timeZone?: string 
  mode?: 'AGENDA' | 'DAY' | 'WEEK' | 'MONTH'
}

const TimeZoneCalendar: React.FC<TimeZoneCalendarProps> = ({ calendarId, timeZone, mode = "AGENDA" }) => {
  const [currentTimeZone, setCurrentTimeZone] = useState('America/Los_Angeles');

  useEffect(() => {
    if (!timeZone) {
      const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      setCurrentTimeZone(userTimeZone);
    } else {
      setCurrentTimeZone(timeZone);
    }
  }, [timeZone]);

  const src = `https://calendar.google.com/calendar/embed?src=${calendarId}&ctz=${currentTimeZone}&mode=${mode}`;

  return (
    <>
      <iframe
        className="w-full"
        src={src}
        style={{ border: 0 }}
        width="800"
        height="600"
        frameBorder="0"
      ></iframe>
    </>
  );
};

export default TimeZoneCalendar;
