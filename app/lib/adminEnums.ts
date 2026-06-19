export const providerTypes = [
  { label: "Bus", value: 1 },
  { label: "Airline", value: 2 },
  { label: "Railway", value: 3 },
  { label: "Hotel", value: 4 }
];

export const providerStatuses = [
  { label: "Active", value: 1 },
  { label: "Inactive", value: 2 },
  { label: "Suspended", value: 3 }
];

export const productTypes = [
  { label: "Bus", value: 1 },
  { label: "Flight", value: 2 },
  { label: "Train", value: 3 },
  { label: "Hotel", value: 4 }
];

export const productStatuses = [
  { label: "Active", value: 1 },
  { label: "Inactive", value: 2 }
];

export const inventoryTypes = [
  { label: "Seat", value: 1 },
  { label: "Berth", value: 2 },
  { label: "Room", value: 3 },
  { label: "Cabin", value: 4 }
];

export const inventoryStatuses = [
  { label: "Active", value: 1 },
  { label: "Maintenance", value: 2 },
  { label: "Retired", value: 3 }
];

export const locationTypes = [
  { label: "City", value: 1 },
  { label: "Airport", value: 2 },
  { label: "Station", value: 3 },
  { label: "Terminal", value: 4 }
];

export const scheduleStatuses = [
  { label: "Scheduled", value: 1 },
  { label: "Boarding", value: 2 },
  { label: "Departed", value: 3 },
  { label: "Arrived", value: 4 },
  { label: "Cancelled", value: 5 },
  { label: "Delayed", value: 6 }
];

export function labelForValue(options: Array<{ label: string; value: number }>, value?: number | null) {
  if (value === null || value === undefined) return "-";
  return options.find((item) => item.value === value)?.label ?? String(value);
}
