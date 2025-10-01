import { cn } from "@/lib/utils";
import type { SVGProps } from "react";

const Logo = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={cn("text-primary", props.className)}
    {...props}
  >
    <path
      d="M13 3L10 6L13 11L14.5 10L12 6L15 3L13 3Z"
      fill="currentColor"
    />
    <path
      d="M16 8C12.6863 8 10 10.6863 10 14V28H12V14C12 11.7909 13.7909 10 16 10C18.2091 10 20 11.7909 20 14V28H22V14C22 10.6863 19.3137 8 16 8Z"
      fill="currentColor"
    />
    <path
      d="M10 28C10 29.1046 9.10457 30 8 30C6.89543 30 6 29.1046 6 28C6 26.8954 6.89543 26 8 26C9.10457 26 10 26.8954 10 28Z"
      fill="currentColor"
    />
    <path
      d="M22 28C22 29.1046 22.8954 30 24 30C25.1046 30 26 29.1046 26 28C26 26.8954 25.1046 26 24 26C22.8954 26 22 26.8954 22 28Z"
      fill="currentColor"
    />
  </svg>
);
export default Logo;
