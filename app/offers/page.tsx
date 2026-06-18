import TopNav from "../components/TopNav";
import OffersClient from "./OffersClient";

export default function OffersPage() {
  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <TopNav active="offers" />
      <OffersClient />
    </div>
  );
}
