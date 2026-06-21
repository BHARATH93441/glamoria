import * as React from "react";

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    const mql = window.matchMedia("(max-width: 768px)");
    const onChange = () => {
      setIsMobile(window.innerWidth < 768);
    };

    onChange();
    mql.addEventListener("change", onChange);

    return () => {
      mql.removeEventListener("change", onChange);
    };
  }, []);

  return !!isMobile;
}
