import type React from "react";

/**
 * Standard React event handler types
 */
export type MouseEventHandler<T extends HTMLElement = HTMLElement> = (
  event: React.MouseEvent<T>
) => void;

export type ChangeEventHandler<T extends HTMLElement = HTMLElement> = (
  event: React.ChangeEvent<T>
) => void;

export type KeyboardEventHandler<T extends HTMLElement = HTMLElement> = (
  event: React.KeyboardEvent<T>
) => void;

/**
 * Custom event types
 */
export interface LanguageChangeEvent extends CustomEvent {
  detail: {
    language: string;
  };
}
