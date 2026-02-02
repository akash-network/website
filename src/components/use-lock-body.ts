// use-lock-body.js

import { useEffect } from "react";

export function useLockBody(open: boolean) {
  useEffect(() => {
    if (open) {
      // Disable scrolling on the body element when the mobile menu is open
      document.body.style.overflow = "hidden";
    } else {
      // Re-enable scrolling when the mobile menu is closed
      document.body.style.overflow = "auto";
    }

    // Clean up the effect
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [open]);
}
