const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const dateTimeFormatter = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export function formatDate(date?: Date | string | null) {
  if (!date) {
    return "Non renseigne";
  }

  return dateFormatter.format(new Date(date));
}

export function formatDateTime(date?: Date | string | null) {
  if (!date) {
    return "Non renseigne";
  }

  return dateTimeFormatter.format(new Date(date));
}

export function dateInputValue(date: Date | string) {
  return new Date(date).toISOString().slice(0, 10);
}

export function startOfCurrentMonth() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

export function endOfToday() {
  const now = new Date();
  now.setHours(23, 59, 59, 999);
  return now;
}
