import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { NavItem } from "@/types/navigation";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function findPrevAndNextPages(
  nav: NavItem[],
  pathname: string,
): { prevPage: NavItem | null; nextPage: NavItem | null } {
  const currentIndex = nav.findIndex((item: NavItem) => item.link === pathname);

  const prevIndex = currentIndex - 1;
  const nextIndex = currentIndex + 1;

  const prevPage = prevIndex >= 0 ? nav[prevIndex] : null;
  const nextPage = nextIndex < nav.length ? nav[nextIndex] : null;

  return { prevPage, nextPage };
}

export function appendSearchParams(params: {
  [key: string]: string | number | boolean;
}) {
  const urlParams = new URLSearchParams("");
  Object.keys(params).forEach((p) => {
    if (params[p]) {
      urlParams.set(p, params[p].toString());
    }
  });

  const res = urlParams.toString();

  return !!res ? `?${res}` : res;
}

export const getShortText = (text: string, length: number) => {
  return text.length < length ? text : `${text.substring(0, length - 3)}...`;
};

export const getSplitText = (
  text: string,
  start: number = 5,
  end: number = 5,
) => {
  const splittedText = [
    text?.slice(0, start),
    "...",
    text?.slice(text?.length - end),
  ].join("");

  return splittedText;
};

export const useFriendlyMessageType = (type: string) => {
  if (!type) return "";

  const splittedType = type.split(".");
  const msgType = splittedType[splittedType.length - 1];
  const friendlyMessageType = msgType
    .substring(3)
    .split(/(?=[A-Z])/)
    .join(" ");

  return friendlyMessageType;
};
