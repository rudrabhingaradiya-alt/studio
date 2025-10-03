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
      d="M16 8C13.7909 8 12 9.79086 12 12C12 14.2091 13.7909 16 16 16C18.2091 16 20 14.2091 20 12C20 9.79086 18.2091 8 16 8Z"
      fill="currentColor"
    />
    <path
      d="M14 17H18V21H21V23H11V21H14V17Z"
      fill="currentColor"
    />
    <path
      d="M10 24H22V26H10V24Z"
      fill="currentColor"
    />
  </svg>
);
export default Logo;
