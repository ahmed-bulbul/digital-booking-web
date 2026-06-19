import TopNav from "../components/TopNav";
import BookingsClient from "./BookingsClient";

export default function BookingsPage() {
  return (
    <div className="min-h-screen bg-surface">
      <TopNav active="bookings" />
      <BookingsClient />
    </div>
  );
}
