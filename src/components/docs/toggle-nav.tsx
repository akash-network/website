import React from "react";
import type { NavItem } from "@/types/navigation";

const ToggleNav = ({ nav, pathname }: { nav: NavItem[] | undefined; pathname: string | undefined }) => {
  return (
    <div className="mb-3 flex items-center justify-between border-b">
      <div className="flex gap-6">
        {nav?.map((item: NavItem, index: number) => {
          return (
            <a
              key={index}
              href={item.link}
              className={`
            ${
              pathname?.split("/")[2] === item.link?.split("/")[2]
                ? "border-b-2  border-primary text-primary"
                : "text-para"
            }
            px-2 py-2 text-sm font-bold`}
            >
              {item.label}
            </a>
          );
        })}
      </div>
      {/* <a
        href="/"
        className="flex w-fit cursor-pointer items-center gap-x-2 rounded-lg px-2 py-1 text-xs font-medium leading-[16px] text-para hover:bg-primary/10 hover:text-primary"
      >
        <svg
          width="4"
          height="8"
          viewBox="0 0 4 8"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M3.5 1L0.5 4L3.5 7"
            stroke="#687076"
            strokeLinecap="round"
            strokeLinejoin="round"
          ></path>
        </svg>
        akash.network
      </a> */}
    </div>
  );
};

export default ToggleNav;
