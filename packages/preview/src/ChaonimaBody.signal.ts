import { signal } from "@preact/signals-react";

export const textSignal = signal<string>("");
export const thinkingSignal = signal<string>("");

export function appendText(t: string) {
  textSignal.value += t;
}

export function appendThinking(t: string) {
  thinkingSignal.value += t;
}

export function clearAll() {
  textSignal.value = "";
  thinkingSignal.value = "";
}
