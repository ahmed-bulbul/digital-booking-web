"use client";

import { useEffect, useState } from "react";
import { subscribeLoadingBar } from "../lib/loadingBar";

export default function TopBarLoader() {
  const [active, setActive] = useState(false);

  useEffect(() => {
    return subscribeLoadingBar(setActive);
  }, []);

  if (!active) return null;

  return (
    <div className="loading-bar" role="status" aria-live="polite" aria-label="Loading">
      <span className="loading-bar__inner" />
    </div>
  );
}
