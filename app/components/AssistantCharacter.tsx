"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";

export type AssistantState =
  | "idle" | "listening" | "understanding" | "thinking" | "searching"
  | "generating" | "tool-calling" | "success" | "error" | "waiting";

export type AssistantTuning = {
  thinkingDuration: number;
  pulseDuration: number;
  thinkingMinScale: number;
  thinkingScale: number;
  thinkingDirection: "ltr" | "rtl";
  thinkingFlow: "none" | "matrix" | "columns";
  thinkingScanEnabled: boolean;
  thinkingBandWidth: number;
};

export const defaultAssistantTuning: AssistantTuning = {
  thinkingDuration: 1.55,
  pulseDuration: 1.55,
  thinkingMinScale: .84,
  thinkingScale: 1.08,
  thinkingDirection: "ltr",
  thinkingFlow: "columns",
  thinkingScanEnabled: true,
  thinkingBandWidth: 5,
};

type Props = {
  state: AssistantState;
  label?: string;
  className?: string;
  tuning?: AssistantTuning;
};

const waitingEyes = ["waiting1", "waiting3", "waiting4", "waiting5"] as const;

function useAlternatingVariant<T extends string>(active: boolean, first: T, second: T, minDelay: number, spread: number) {
  const [variant, setVariant] = useState<T>(first);

  useEffect(() => {
    setVariant(first);
    if (!active || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let timer: ReturnType<typeof setTimeout>;
    let current = first;
    const alternate = () => {
      current = current === first ? second : first;
      setVariant(current);
      timer = setTimeout(alternate, minDelay + Math.random() * spread);
    };
    timer = setTimeout(alternate, minDelay + Math.random() * spread);
    return () => clearTimeout(timer);
  }, [active, first, second, minDelay, spread]);

  return variant;
}

function useWaitingEyes(active: boolean) {
  const [frame, setFrame] = useState<(typeof waitingEyes)[number] | "waiting2">("waiting1");

  useEffect(() => {
    if (!active) {
      setFrame("waiting1");
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let timer: ReturnType<typeof setTimeout>;
    let current: (typeof waitingEyes)[number] = "waiting1";
    const blink = () => {
      setFrame("waiting2");
      timer = setTimeout(lookElsewhere, 110 + Math.random() * 50);
    };
    const lookElsewhere = () => {
      const choices = waitingEyes.filter((item) => item !== current);
      current = choices[Math.floor(Math.random() * choices.length)];
      setFrame(current);
      timer = setTimeout(blink, 1300 + Math.random() * 1800);
    };

    timer = setTimeout(blink, 1200 + Math.random() * 1000);
    return () => clearTimeout(timer);
  }, [active]);

  return frame;
}

function useToolCallingPhase(active: boolean) {
  const [phase, setPhase] = useState<"flash" | "tool">("flash");
  useEffect(() => {
    setPhase("flash");
    if (!active) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setPhase("tool");
      return;
    }
    const timer = setTimeout(() => setPhase("tool"), 2200);
    return () => clearTimeout(timer);
  }, [active]);
  return phase;
}

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
    const dots = Array.from(
      container.querySelectorAll<SVGGraphicsElement>(`#${eyeId} circle, #${eyeId} ellipse`),
    );
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

function indexAnimatedLayer(container: ParentNode, id: string, className: string, direction: "horizontal" | "diagonal-down-left") {
  const dots = Array.from(container.querySelectorAll<SVGGraphicsElement>(`#${id} circle, #${id} ellipse`));
  const values = dots.map((dot) => {
    const x = Number(dot.getAttribute("cx"));
    const y = Number(dot.getAttribute("cy"));
    // The smallest diagonal value starts first: upper-right -> lower-left.
    return direction === "horizontal" ? x : y - x;
  });
  const min = Math.min(...values);
  const range = Math.max(1, Math.max(...values) - min);
  dots.forEach((dot, index) => {
    const progress = (values[index] - min) / range;
    dot.classList.add(className);
    dot.style.setProperty(`--${className}-delay`, `${(-progress * 1.45).toFixed(2)}s`);
  });
}

function indexThinkingLayer(container: ParentNode, duration: number, bandWidth: number) {
  const dots = Array.from(container.querySelectorAll<SVGGraphicsElement>("#eye-thinking circle, #eye-thinking ellipse"));
  const xs = [...new Set(dots.map((dot) => Number(dot.getAttribute("cx"))))].sort((a, b) => a - b);
  const ys = dots.map((dot) => Number(dot.getAttribute("cy")));
  const minY = Math.min(...ys);
  const rangeY = Math.max(1, Math.max(...ys) - minY);
  // More separation between neighboring peaks produces a visibly thinner scan band.
  const stagger = duration * (2.3 - bandWidth * .18);
  dots.forEach((dot) => {
    const x = Number(dot.getAttribute("cx"));
    const y = Number(dot.getAttribute("cy"));
    const column = xs.indexOf(x);
    const columnProgress = column / Math.max(1, xs.length - 1);
    const pointProgress = (column + ((y - minY) / rangeY) * .55) / Math.max(1, xs.length - .45);
    dot.classList.add("thinking-sweep");
    dot.style.setProperty("--thinking-column-ltr-delay", `${(-columnProgress * stagger).toFixed(2)}s`);
    dot.style.setProperty("--thinking-column-rtl-delay", `${(-(1 - columnProgress) * stagger).toFixed(2)}s`);
    dot.style.setProperty("--thinking-point-ltr-delay", `${(-pointProgress * stagger).toFixed(2)}s`);
    dot.style.setProperty("--thinking-point-rtl-delay", `${(-(1 - pointProgress) * stagger).toFixed(2)}s`);
  });
}

function wrapPulseDots(container: ParentNode, tuning: AssistantTuning) {
  const pulseDuration = Number.isFinite(tuning.pulseDuration) && tuning.pulseDuration > 0
    ? tuning.pulseDuration
    : defaultAssistantTuning.pulseDuration;
  const selectors = [
    "#eye-left", "#eye-right", "#eye-thinking", "#eye-tool-calling",
    "#eye-waiting1", "#eye-waiting2", "#eye-waiting3", "#eye-waiting4", "#eye-waiting5",
  ];
  selectors.forEach((selector) => {
    const dots = Array.from(container.querySelectorAll<SVGGraphicsElement>(`${selector} circle, ${selector} ellipse`));
    const columns = [...new Set(dots.map((dot) => Number(dot.getAttribute("cx"))))].sort((a, b) => a - b);
    dots.forEach((dot) => {
      const wrapper = dot.ownerDocument.createElementNS("http://www.w3.org/2000/svg", "g");
      wrapper.classList.add("dot-pulse-layer");
      wrapper.setAttribute("data-pulse-x", dot.getAttribute("cx") ?? "0");
      const column = columns.indexOf(Number(dot.getAttribute("cx")));
      const progress = column / Math.max(1, columns.length - 1);
      wrapper.style.setProperty("--pulse-delay", `${(progress * pulseDuration * .72).toFixed(3)}s`);
      wrapper.style.setProperty("--pulse-delay-reverse", `${((1 - progress) * pulseDuration * .72).toFixed(3)}s`);
      wrapper.style.setProperty("transform-box", "fill-box");
      wrapper.style.setProperty("transform-origin", "center");
      dot.parentNode?.insertBefore(wrapper, dot);
      wrapper.appendChild(dot);
    });
  });
}

function prepareSvgMarkup(markup: string, tuning: AssistantTuning) {
  const document = new DOMParser().parseFromString(markup, "image/svg+xml");
  indexEyeDots(document);
  indexThinkingLayer(document, tuning.thinkingDuration, tuning.thinkingBandWidth);
  indexAnimatedLayer(document, "eye-tool-calling", "tool-sweep", "diagonal-down-left");
  wrapPulseDots(document, tuning);
  return document.documentElement.outerHTML;
}

export function AssistantCharacter({ state, label = "AI Assistant", className = "", tuning = defaultAssistantTuning }: Props) {
  const [svgSource, setSvgSource] = useState("");
  const blinking = useNaturalBlink(state);
  const waitingEye = useWaitingEyes(state === "waiting");
  const errorExpression = useAlternatingVariant(state === "error", "cross", "cry", 1800, 1000);
  const toolCallingPhase = useToolCallingPhase(state === "tool-calling");
  const motionStyle = {
    "--thinking-duration": `${tuning.thinkingDuration}s`,
    "--thinking-min-scale": tuning.thinkingMinScale,
    "--thinking-scale": tuning.thinkingScale,
    "--pulse-duration": `${tuning.pulseDuration ?? defaultAssistantTuning.pulseDuration}s`,
  } as CSSProperties;
  const svgMarkup = useMemo(
    () => svgSource ? prepareSvgMarkup(svgSource, tuning) : "",
    [svgSource, tuning.thinkingDuration, tuning.thinkingBandWidth, tuning.pulseDuration],
  );

  useEffect(() => {
    let active = true;
    fetch("/assistant-character.svg")
      .then((response) => response.text())
      .then((markup) => {
        if (active) setSvgSource(markup);
      });
    return () => { active = false; };
  }, []);

  return (
    <div
      className={`assistant assistant--${state} ${blinking ? "is-blinking" : ""} ${className}`}
      data-state={state}
      data-waiting-eye={waitingEye}
      data-success-expression="smile"
      data-error-expression={errorExpression}
      data-tool-calling-phase={toolCallingPhase}
      data-thinking-direction={tuning.thinkingDirection}
      data-thinking-flow={tuning.thinkingFlow}
      data-thinking-scan={tuning.thinkingScanEnabled ? "on" : "off"}
      style={motionStyle}
      role="img"
      aria-label={label}
      dangerouslySetInnerHTML={{ __html: svgMarkup }}
    />
  );
}
