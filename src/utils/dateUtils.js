// Date and formatting utility functions

export const formatDate = (dateString, format = 'medium') => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  if (format === 'short') {
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
    });
  }
  if (format === 'full') {
    return date.toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }
  // medium
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export const formatTime = (timeString) => {
  if (!timeString) return '-';
  // If it's already HH:MM AM/PM
  if (timeString.includes('AM') || timeString.includes('PM')) return timeString;
  
  // If it's HH:MM (24-hour)
  const parts = timeString.split(':');
  if (parts.length >= 2) {
    let hours = parseInt(parts[0], 10);
    const minutes = parts[1];
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // 0 should be 12
    return `${hours}:${minutes} ${ampm}`;
  }
  return timeString;
};

export const getTodayDateString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getCurrentMonthString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

export const getMonthName = (monthIndex) => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[monthIndex];
};

export const getDaysInMonth = (year, month) => {
  // month is 1-indexed (1 = Jan, 12 = Dec)
  return new Date(year, month, 0).getDate();
};

export const getDaysArrayForMonth = (year, month) => {
  const totalDays = getDaysInMonth(year, month);
  const days = [];
  for (let i = 1; i <= totalDays; i++) {
    const dayStr = String(i).padStart(2, '0');
    const monthStr = String(month).padStart(2, '0');
    const dateStr = `${year}-${monthStr}-${dayStr}`;
    const dateObj = new Date(year, month - 1, i);
    const dayOfWeek = dateObj.getDay(); // 0 = Sunday, 6 = Saturday
    days.push({
      day: i,
      dateString: dateStr,
      isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
      dayName: dateObj.toLocaleDateString('en-US', { weekday: 'short' }),
    });
  }
  return days;
};

export const formatCurrency = (amount = 0) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const numberToWords = (num) => {
  if (!num) return 'Zero Rupees Only';
  const a = [
    '', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ',
    'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const inWords = (n) => {
    if (n < 20) return a[n];
    const digit = n % 10;
    return b[Math.floor(n / 10)] + (digit !== 0 ? ' ' + a[digit] : '');
  };

  let str = '';
  const crore = Math.floor(num / 10000000);
  num %= 10000000;
  const lakh = Math.floor(num / 100000);
  num %= 100000;
  const thousand = Math.floor(num / 1000);
  num %= 1000;
  const hundred = Math.floor(num / 100);
  num %= 100;

  if (crore > 0) str += inWords(crore) + ' Crore ';
  if (lakh > 0) str += inWords(lakh) + ' Lakh ';
  if (thousand > 0) str += inWords(thousand) + ' Thousand ';
  if (hundred > 0) str += inWords(hundred) + ' Hundred ';
  if (num > 0) {
    if (str !== '') str += 'and ';
    str += inWords(num);
  }
  return str.trim() + ' Rupees Only';
};

/**
 * Parses time string like "09:30 AM", "9:30 AM", "06:15 PM" or "18:45" to minutes from midnight
 */
export const parseTimeToMinutes = (timeStr) => {
  if (!timeStr) return 0;
  const clean = timeStr.trim();
  const isPM = clean.toUpperCase().includes('PM');
  const isAM = clean.toUpperCase().includes('AM');
  const digitsPart = clean.replace(/[^\d:]/g, '');
  const parts = digitsPart.split(':');
  let h = parseInt(parts[0] || '0', 10);
  const m = parseInt(parts[1] || '0', 10);
  if (isPM && h < 12) h += 12;
  if (isAM && h === 12) h = 0;
  return h * 60 + m;
};

/**
 * Accurately calculates work duration between punch-in and punch-out strings, handling cross-midnight night shifts
 */
export const calculateWorkDuration = (inTimeStr, outTimeStr, inDateStr, outDateStr) => {
  if (!inTimeStr || !outTimeStr) return '0h 0m';
  const inMins = parseTimeToMinutes(inTimeStr);
  const outMins = parseTimeToMinutes(outTimeStr);

  let diffMins = outMins - inMins;
  // If overnight shift across days or time rolled past midnight
  if (diffMins < 0 || (inDateStr && outDateStr && inDateStr !== outDateStr)) {
    diffMins += 24 * 60;
  }
  if (diffMins < 0) diffMins = 0;

  const hours = Math.floor(diffMins / 60);
  const minutes = diffMins % 60;
  return `${hours}h ${minutes}m`;
};

/**
 * Evaluates punch-in status based on company shift policies (Present, Late, Half-Day)
 */
export const evaluatePunchStatus = (punchTimeStr, shiftStartTime = '09:30', gracePeriodMins = 15, halfDayHours = 4.5) => {
  const punchMins = parseTimeToMinutes(punchTimeStr);
  const shiftStartMins = parseTimeToMinutes(shiftStartTime);
  const graceCutoff = shiftStartMins + Number(gracePeriodMins || 15);
  const halfDayCutoff = shiftStartMins + Math.round(Number(halfDayHours || 4.5) * 60);

  if (punchMins <= graceCutoff) {
    return { status: 'Present', isLate: false, lateMinutes: 0 };
  } else if (punchMins <= halfDayCutoff) {
    return { status: 'Late', isLate: true, lateMinutes: punchMins - shiftStartMins };
  } else {
    return { status: 'Half-Day', isLate: true, lateMinutes: punchMins - shiftStartMins };
  }
};

