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
      d="M16 6C13.7909 6 12 7.79086 12 10C12 12.2091 13.7909 14 16 14C18.2091 14 20 12.2091 20 10C20 7.79086 18.2091 6 16 6Z"
      fill="currentColor"
    />
    <path
      d="M13 15H19V18L22 18V22H24V24H8V22H10V18L13 18V15Z"
      fill="currentColor"
    />
    <path d="M8 25H24V27H8V25Z" fill="currentColor" />
  </svg>
);
export default Logo;
