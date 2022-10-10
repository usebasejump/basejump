import { ReactNode, useEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function Portal(props: { children: ReactNode }) {
  let { children } = props;
  let [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;
  return createPortal(children, document.body);
}
