"use client";

import { useState } from "react";
import { AssistantCharacter, type AssistantState } from "./components/AssistantCharacter";

const states: { value: AssistantState; label: string; note: string }[] = [
  { value: "idle", label: "Idle", note: "自然呼吸与随机眨眼" },
  { value: "listening", label: "Listening", note: "专注、轻微前倾" },
  { value: "understanding", label: "Understanding", note: "视线向中心聚合" },
  { value: "thinking", label: "Thinking", note: "点阵错相流动" },
  { value: "searching", label: "Searching", note: "视线左右检索" },
  { value: "generating", label: "Generating", note: "点阵稳定向下输出" },
  { value: "tool-calling", label: "Tool Calling", note: "Visor 单次机械反馈" },
  { value: "success", label: "Success", note: "克制的完成反馈" },
  { value: "error", label: "Error", note: "黑白错误表达" },
  { value: "waiting", label: "Waiting", note: "安静地等待用户" },
];

export default function Home() {
  const [state, setState] = useState<AssistantState>("idle");
  const active = states.find((item) => item.value === state)!;

  return (
    <main>
      <header className="topbar">
        <div className="brand"><span className="brand-mark" />Assistant Motion System</div>
        <div className="status"><span className="status-dot" />{active.label}</div>
      </header>

      <section className="stage" aria-live="polite">
        <div className="stage-copy">
          <p className="eyebrow">CURRENT STATE</p>
          <h1>{active.label}</h1>
          <p>{active.note}</p>
        </div>
        <AssistantCharacter state={state} label={`Assistant state: ${active.label}`} />
        <p className="motion-note">Minimal · Calm · Mechanical · Alive</p>
      </section>

      <nav className="controls" aria-label="Assistant states">
        {states.map((item) => (
          <button
            type="button"
            key={item.value}
            className={state === item.value ? "active" : ""}
            aria-pressed={state === item.value}
            onClick={() => setState(item.value)}
          >
            <span>{item.label}</span>
            <small>{item.value}</small>
          </button>
        ))}
      </nav>
    </main>
  );
}
