import TopNav from "../components/TopNav";
import SeatSelectionClient from "./SeatSelectionClient";

const STATUS_AVAILABLE = 1;

type ScheduleInventoryItem = {
  scheduleInventoryId: number;
  inventoryId: number;
  itemNumber: string;
  classId: number;
  className: string;
  type: number;
  attributes?: Record<string, unknown> | null;
  status: number;
  lockVersion: number;
  lockedUntil?: string | null;
  finalPrice?: number | null;
  taxAmount?: number | null;
  currency?: string | null;
};

type ScheduleInventoryLayout = {
  scheduleId: number;
  items: ScheduleInventoryItem[];
};

type ScheduleDetail = {
  scheduleId: number;
  productId?: number | null;
  productName?: string | null;
  providerId?: number | null;
  providerName?: string | null;
  routeId?: number | null;
  sourceName?: string | null;
  sourceCity?: string | null;
  destinationName?: string | null;
  destinationCity?: string | null;
  departureAt?: string | null;
  arrivalAt?: string | null;
  availableCount?: number | null;
};

type ApiResponse<T> = {
  success: boolean;
  data: T;
  error?: { code: string; message: string } | null;
};

type SearchParams = {
  scheduleId?: string;
};

async function fetchInventoryLayout(scheduleId: number) {
  const baseUrl = process.env.API_BASE_URL ?? "https://b84d-103-72-212-59.ngrok-free.app";
  const res = await fetch(`${baseUrl}/api/schedules/${scheduleId}/inventory`, {
    cache: "no-store"
  });
  if (!res.ok) {
    return null;
  }
  const payload = (await res.json()) as ApiResponse<ScheduleInventoryLayout>;
  return payload.data ?? null;
}

async function fetchScheduleDetail(scheduleId: number) {
  const baseUrl = process.env.API_BASE_URL ?? "https://b84d-103-72-212-59.ngrok-free.app";
  const res = await fetch(`${baseUrl}/api/schedules/${scheduleId}`, {
    cache: "no-store"
  });
  if (!res.ok) {
    return null;
  }
  const payload = (await res.json()) as ApiResponse<ScheduleDetail>;
  return payload.data ?? null;
}

export default async function SeatSelectionPage({
  searchParams
}: {
  searchParams: SearchParams;
}) {
  const scheduleId = Number(searchParams.scheduleId ?? 0);
  const [layout, scheduleDetail] = scheduleId
    ? await Promise.all([fetchInventoryLayout(scheduleId), fetchScheduleDetail(scheduleId)])
    : [null, null];

  const safeItems = (layout?.items ?? []).map((item) => ({
    ...item,
    status: item.status ?? STATUS_AVAILABLE,
    lockVersion: item.lockVersion ?? 0
  }));

  return (
    <>
      <TopNav active="bookings" />
      <SeatSelectionClient items={safeItems} scheduleDetail={scheduleDetail} />
    </>
  );
}
