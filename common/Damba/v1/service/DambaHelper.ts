import { Http } from "./IServiceDamba";

/* eslint-disable @typescript-eslint/no-unused-vars */
export function firstCharToUppercase(text: string): string {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export const createSimpleName = (name: string) => {
  const hasSlash = name.includes('/');
  if (!hasSlash) return name
  const words = name.split('/');
  const nWords = []
  let i = 0;
  for (let j = 0; j < words.length; j++) {
    const w = words[j];
    if (i == 0 && w == "" || w == undefined) {
      continue;
    }
    if (i == 0 && w != "" || w != undefined) {
      nWords.push(w);
      continue;
    }
    nWords.push(firstCharToUppercase(w));
    i++;
  }
  return nWords.join("");
}

export const toHttpEnum = (value: string): Http | undefined => {
  return Object.values(Http).includes(value as Http)
    ? (value as Http)
    : undefined
}

/** A key is a "route" if it is exactly "/" OR contains a "/" */
export type RouteKey = '/' | `${string}/${string}`;