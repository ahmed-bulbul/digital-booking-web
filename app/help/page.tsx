import TopNav from "../components/TopNav";
import HelpClient from "./HelpClient";

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <TopNav active="help" />
      <HelpClient />
    </div>
  );
}
