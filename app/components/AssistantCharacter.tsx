"use client";

import { useEffect, useMemo, useState } from "react";

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
        openTimer = setTimeout(() => { setBlinking(false); schedule(); }, 110 + Math.random() * 60);
      }, 2800 + Math.random() * 4800);
    };
    schedule();
    return () => { clearTimeout(blinkTimer); clearTimeout(openTimer); setBlinking(false); };
  }, [state]);
  return blinking;
}

const eyeDots = Array.from({ length: 54 }, (_, i) => ({
  col: i % 6,
  row: Math.floor(i / 6),
}));

export function AssistantCharacter({ state, label = "AI Assistant", className = "" }: Props) {
  const blinking = useNaturalBlink(state);
  const dotList = useMemo(() => eyeDots, []);

  return (
    <div className={`assistant assistant--${state} ${blinking ? "is-blinking" : ""} ${className}`} data-state={state}>
      <svg className="assistant-svg" viewBox="0 0 480 660" role="img" aria-label={label}>
        <g className="assistant-float">
          <g className="assistant-body">
            <path className="limb left-arm" d="M160 359C129 385 102 428 88 477c-8 28 7 50 35 56 26 6 48-8 54-36l18-91z" />
            <path className="limb right-arm" d="M320 359c31 26 58 69 72 118 8 28-7 50-35 56-26 6-48-8-54-36l-18-91z" />
            <path className="hand left-hand" d="M86 473c9-24 34-34 57-25 22 9 31 35 21 58-9 23-33 35-57 25-23-9-31-34-21-58z" />
            <path className="hand right-hand" d="M394 473c-9-24-34-34-57-25-22 9-31 35-21 58 9 23 33 35 57 25 23-9 31-34 21-58z" />
            <path className="torso" d="M167 348c21-12 125-12 146 0l18 98-30 83c-24 19-98 19-122 0l-30-83z" />
            <path className="belly-panel" d="M153 445c24 12 50 18 87 18s63-6 87-18l-12 76c-18 25-132 25-150 0z" />
            <path className="panel-slot" d="M222 459c5-8 31-8 36 0" />
            <path className="leg left-leg" d="M180 526l58 2-11 99c-4 19-51 20-59 5z" />
            <path className="leg right-leg" d="M242 528l58-2 12 106c-8 15-55 14-59-5z" />
            <path className="boot left-boot" d="M168 617c17-7 40-7 59 1l-1 20c-4 15-51 15-60 5-3-4-1-18 2-26z" />
            <path className="boot right-boot" d="M253 618c19-8 42-8 59-1 3 8 5 22 2 26-9 10-56 10-60-5z" />
            <g className="chest-logo" aria-label="Chest logo">
              <path d="M253 396h20l-8 7h-9l-5 8h13l-7 7h-17z" />
              <path d="M238 420h25l-7 4h-14z" opacity=".7" />
            </g>
          </g>

          <g className="assistant-head">
            <path className="ear left-ear" d="M89 119C82 71 105 44 142 61l28 32-49 68z" />
            <path className="ear-cap left-ear-cap" d="M96 86c10-28 32-34 51-19l13 18c-24-9-45-8-64 1z" />
            <path className="ear right-ear" d="M391 119c7-48-16-75-53-58l-28 32 49 68z" />
            <path className="ear-cap right-ear-cap" d="M384 86c-10-28-32-34-51-19l-13 18c24-9 45-8 64 1z" />
            <path className="helmet" d="M75 203C78 104 141 55 240 54c99 1 162 50 165 149l-1 99c-2 77-53 114-164 114S78 379 76 302z" />
            <path className="neck" d="M166 406c4 25 144 25 148 0l-17-21H183z" />
            <g className="visor-mechanism">
              <path className="visor-frame" d="M99 208c3-66 49-101 141-101s138 35 141 101v83c-2 64-46 94-141 94S101 355 99 291z" />
              <path className="visor" d="M110 211c4-57 43-89 130-89s126 32 130 89v75c-3 55-42 84-130 84s-127-29-130-84z" />
              <g className="visor-reflection" aria-hidden="true">
                <path d="M129 163l57-19 6 48-70 9z" />
                <path d="M199 140h58v51h-56z" />
                <path d="M270 142l63 18-8 42-57-10z" />
              </g>
              <g className="eye-system">
                <g className="eye eye-left">
                  {dotList.map(({ col, row }, i) => <circle key={i} className={`dot dot-c${col} dot-r${row}`} cx={201 + col * 8} cy={215 + row * 8} r="3.25" />)}
                </g>
                <g className="eye eye-right">
                  {dotList.map(({ col, row }, i) => <circle key={i} className={`dot dot-c${col} dot-r${row}`} cx={282 + col * 8} cy={215 + row * 8} r="3.25" />)}
                </g>
              </g>
              <path className="visor-inner-line" d="M111 297c8 48 48 72 129 72s121-24 129-72" />
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
}
