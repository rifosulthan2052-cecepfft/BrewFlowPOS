import type { SVGProps } from "react";

export function CoffeeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M10 2v2" />
      <path d="M14 2v2" />
      <path d="M16 8a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2" />
      <path d="M7 12a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h1" />
      <path d="M19 12h-2a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2Z" />
    </svg>
  );
}
