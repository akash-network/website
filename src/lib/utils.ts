import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function findPrevAndNextPages(nav: any, pathname: any) {
  // Find the index of the current page in the nav array
  const currentIndex = nav.findIndex((item: any) => item.link === pathname);

  // Calculate the index of the previous and next pages
  const prevIndex = currentIndex - 1;
  const nextIndex = currentIndex + 1;

  // Determine the previous and next pages
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
    .substring(3) // Remove "Msg"
    .split(/(?=[A-Z])/)
    .join(" ");

  return friendlyMessageType;
};
