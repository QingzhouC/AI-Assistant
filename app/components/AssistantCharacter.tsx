"use client";

import { useEffect, useState } from "react";

export type AssistantState =
  | "idle" | "listening" | "understanding" | "thinking" | "searching"
  | "generating" | "tool-calling" | "success" | "error" | "waiting";

type Props = { state: AssistantState; label?: string; className?: string };

function useNaturalBlink(state: AssistantState) {
  const [blinking, setBlinking] = useState(false);

  useEffect(() => {
    if (!["idle", "waiting", "listening"].includes(state)) return;
    let blinkTimer: ReturnType<typeof setTimeout>;
    let openTimer: ReturnType<typeof setTimeout>;
    const schedule = () => {
      blinkTimer = setTimeout(() => {
        setBlinking(true);
        openTimer = setTimeout(() => {
          setBlinking(false);
          schedule();
        }, 110 + Math.random() * 60);
      }, 2800 + Math.random() * 4800);
    };
    schedule();
    return () => {
      clearTimeout(blinkTimer);
      clearTimeout(openTimer);
    };
  }, [state]);

  return blinking;
}

function indexEyeDots(container: ParentNode) {
  const cluster = (values: number[]) => {
    const sorted = [...values].sort((a, b) => a - b);
    return sorted.reduce<number[]>((groups, value) => {
      if (!groups.length || value - groups[groups.length - 1] > 6) groups.push(value);
      else groups[groups.length - 1] = (groups[groups.length - 1] + value) / 2;
      return groups;
    }, []);
  };
  const eyes = ["eye-left", "eye-right"];
  eyes.forEach((eyeId) => {
    const dots = Array.from(container.querySelectorAll<SVGCircleElement>(`#${eyeId} circle`));
    const columns = cluster(dots.map((dot) => Number(dot.getAttribute("cx"))));
    const rows = cluster(dots.map((dot) => Number(dot.getAttribute("cy"))));
    dots.forEach((dot) => {
      const x = Number(dot.getAttribute("cx"));
      const y = Number(dot.getAttribute("cy"));
      const col = columns.reduce((best, value, index) => Math.abs(value - x) < Math.abs(columns[best] - x) ? index : best, 0);
      const row = rows.reduce((best, value, index) => Math.abs(value - y) < Math.abs(rows[best] - y) ? index : best, 0);
      dot.classList.add("assistant-dot", `dot-c${col}`, `dot-r${row}`);
    });
  });
}

function prepareSvgMarkup(markup: string) {
  const document = new DOMParser().parseFromString(markup, "image/svg+xml");
  indexEyeDots(document);
  return document.documentElement.outerHTML;
}

export function AssistantCharacter({ state, label = "AI Assistant", className = "" }: Props) {
  const [svgMarkup, setSvgMarkup] = useState("");
  const blinking = useNaturalBlink(state);

  useEffect(() => {
    let active = true;
    fetch("/assistant-character.svg")
      .then((response) => response.text())
      .then((markup) => {
        if (active) setSvgMarkup(prepareSvgMarkup(markup));
      });
    return () => { active = false; };
  }, []);

  return (
    <div
      className={`assistant assistant--${state} ${blinking ? "is-blinking" : ""} ${className}`}
      data-state={state}
      role="img"
      aria-label={label}
      dangerouslySetInnerHTML={{ __html: svgMarkup }}
    />
  );
}
