"use client";

import { useEffect, useState } from "react";
import {
  AssistantCharacter,
  defaultAssistantTuning,
  type AssistantState,
  type AssistantTuning,
} from "./components/AssistantCharacter";

const states: { value: AssistantState; label: string; note: string }[] = [
  { value: "idle", label: "Idle", note: "自然呼吸、头部回应与轻微手部动作" },
  { value: "listening", label: "Listening", note: "歪头并抬手侧耳倾听" },
  { value: "understanding", label: "Understanding", note: "使用 Curve Arm 并强烈向中心聚焦" },
  { value: "thinking", label: "Thinking", note: "新点阵眼从左向右加载" },
  { value: "searching", label: "Searching", note: "头部稳定，眼睛以更大范围左右扫描" },
  { value: "generating", label: "Generating", note: "两套点阵输出动态随机交替" },
  { value: "tool-calling", label: "Tool Calling", note: "柔和闪烁后从右上向左下扫描" },
  { value: "success", label: "Success", note: "克制的微笑眼完成反馈" },
  { value: "error", label: "Error", note: "叉叉眼与加长 T T 哭泣眼缓慢交替" },
  { value: "waiting", label: "Waiting", note: "随机看向四周，每次经过闭眼" },
];

type RangeProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  onChange: (value: number) => void;
};

function RangeControl({ label, value, min, max, step, unit = "", onChange }: RangeProps) {
  return (
    <label className="tune-range">
      <span>
        <b>{label}</b>
        <span className="tune-number-wrap">
          <input
            className="tune-number"
            type="number"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(event) => onChange(Math.min(max, Math.max(min, Number(event.target.value))))}
          />
          <i>{unit}</i>
        </span>
      </span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} />
    </label>
  );
}

type TuningByState = Record<AssistantState, AssistantTuning>;

const createDefaultTunings = (): TuningByState => Object.fromEntries(
  states.map(({ value }) => [value, { ...defaultAssistantTuning }]),
) as TuningByState;

const normalizeTuning = (value: Partial<AssistantTuning>): AssistantTuning => ({
  ...defaultAssistantTuning,
  ...value,
  thinkingFlow: (value.thinkingFlow as string) === "points" ? "columns" : value.thinkingFlow ?? defaultAssistantTuning.thinkingFlow,
  thinkingDirection: "ltr",
  pulseDuration: Number.isFinite(value.pulseDuration) && Number(value.pulseDuration) > 0
    ? Number(value.pulseDuration)
    : defaultAssistantTuning.pulseDuration,
});

export default function Home() {
  const [state, setState] = useState<AssistantState>("idle");
  const [tuningOpen, setTuningOpen] = useState(true);
  const [tunings, setTunings] = useState<TuningByState>(createDefaultTunings);
  const [saveNotice, setSaveNotice] = useState("");
  const active = states.find((item) => item.value === state)!;
  const tuning = tunings[state];
  const updateTuning = (key: keyof AssistantTuning, value: AssistantTuning[keyof AssistantTuning]) =>
    setTunings((current) => ({
      ...current,
      [state]: { ...current[state], [key]: value } as AssistantTuning,
    }));

  useEffect(() => {
    const savedByState = window.localStorage.getItem("assistant-motion-tuning-by-state");
    const legacySaved = window.localStorage.getItem("assistant-motion-tuning");
    if (!savedByState && !legacySaved) return;
    try {
      if (savedByState) {
        const stored = JSON.parse(savedByState) as Partial<TuningByState>;
        const restored = createDefaultTunings();
        states.forEach(({ value }) => { restored[value] = normalizeTuning(stored[value] ?? {}); });
        setTunings(restored);
      } else if (legacySaved) {
        const legacy = normalizeTuning(JSON.parse(legacySaved));
        const migrated = createDefaultTunings();
        states.forEach(({ value }) => { migrated[value] = { ...legacy }; });
        setTunings(migrated);
      }
      setSaveNotice("已载入各状态保存的参数");
    } catch {
      window.localStorage.removeItem("assistant-motion-tuning");
      window.localStorage.removeItem("assistant-motion-tuning-by-state");
    }
  }, []);

  const confirmTuning = () => {
    const next = { ...tunings, [state]: normalizeTuning(tuning) };
    setTunings(next);
    window.localStorage.setItem("assistant-motion-tuning-by-state", JSON.stringify(next));
    setSaveNotice(`${active.label} 的参数已确认并保存`);
  };

  return (
    <main>
      <header className="topbar">
        <div className="brand"><span className="brand-mark" />AI Assistant</div>
        <div className="topbar-actions">
          <a className="output-preview-link" href="/output">内容界面预览</a>
          <div className="status"><span className="status-dot" />{active.label}</div>
          <button type="button" className={`tune-toggle ${tuningOpen ? "active" : ""}`} onClick={() => setTuningOpen((open) => !open)} aria-expanded={tuningOpen}>点阵眼调参</button>
        </div>
      </header>

      <section className="stage" aria-live="polite">
        <div className="stage-copy">
          <p className="eyebrow">CURRENT STATE</p>
          <h1>{active.label}</h1>
          <p>{active.note}</p>
        </div>
        <AssistantCharacter state={state} tuning={tuning} label={`Assistant state: ${active.label}`} />
        <p className="motion-note">Minimal · Calm · Mechanical · Alive</p>
      </section>

      {tuningOpen && (
        <aside className="tune-panel" aria-label="Motion tuning controls">
          <div className="tune-heading"><span>正在调整：{active.label}</span><button type="button" onClick={() => setTunings((current) => ({ ...current, [state]: { ...defaultAssistantTuning } }))}>重置当前</button></div>
          <span className="tune-choice-label">渐变扫描效果</span>
          <div className="tune-choice">
            <button type="button" className={tuning.thinkingScanEnabled ? "active" : ""} onClick={() => updateTuning("thinkingScanEnabled", true)}>使用扫描效果</button>
            <button type="button" className={!tuning.thinkingScanEnabled ? "active" : ""} onClick={() => updateTuning("thinkingScanEnabled", false)}>关闭扫描效果</button>
          </div>
          <RangeControl label="扫描光移动一轮时长" value={tuning.thinkingDuration} min={.8} max={3} step={.05} unit="秒" onChange={(value) => updateTuning("thinkingDuration", value)} />
          <RangeControl label="扫描光带粗细（1 最细）" value={tuning.thinkingBandWidth} min={1} max={10} step={1} unit="级" onChange={(value) => updateTuning("thinkingBandWidth", value)} />
          <span className="tune-choice-label">点阵变化方式</span>
          <div className="tune-choice tune-flow-choice">
            <button type="button" className={tuning.thinkingFlow === "none" ? "active" : ""} onClick={() => updateTuning("thinkingFlow", "none")}>不使用尺寸动画</button>
            <button type="button" className={tuning.thinkingFlow === "matrix" ? "active" : ""} onClick={() => updateTuning("thinkingFlow", "matrix")}>整个点阵一起呼吸</button>
            <button type="button" className={tuning.thinkingFlow === "columns" ? "active" : ""} onClick={() => updateTuning("thinkingFlow", "columns")}>逐列循环波浪</button>
          </div>
          <span className="tune-choice-label">变化速度</span>
          <div className="tune-choice tune-choice-three">
            <button type="button" onClick={() => updateTuning("pulseDuration", 2.6)}>慢</button>
            <button type="button" onClick={() => updateTuning("pulseDuration", 1.55)}>适中</button>
            <button type="button" onClick={() => updateTuning("pulseDuration", .9)}>快</button>
          </div>
          <span className="tune-choice-label">变化幅度</span>
          <div className="tune-choice tune-choice-three">
            <button type="button" onClick={() => setTunings((current) => ({ ...current, [state]: { ...current[state], thinkingMinScale: .92, thinkingScale: 1.04 } }))}>小</button>
            <button type="button" onClick={() => setTunings((current) => ({ ...current, [state]: { ...current[state], thinkingMinScale: .84, thinkingScale: 1.08 } }))}>适中</button>
            <button type="button" onClick={() => setTunings((current) => ({ ...current, [state]: { ...current[state], thinkingMinScale: .7, thinkingScale: 1.2 } }))}>大</button>
          </div>
          <RangeControl label="波浪／呼吸一轮时长" value={tuning.pulseDuration ?? defaultAssistantTuning.pulseDuration} min={.8} max={3} step={.05} unit="秒" onChange={(value) => updateTuning("pulseDuration", value)} />
          <RangeControl label="点阵缩到最小" value={tuning.thinkingMinScale} min={.55} max={1} step={.01} unit="倍" onChange={(value) => updateTuning("thinkingMinScale", value)} />
          <RangeControl label="点阵放到最大" value={tuning.thinkingScale} min={1.01} max={1.35} step={.01} unit="倍" onChange={(value) => updateTuning("thinkingScale", value)} />
          <button type="button" className="tune-confirm" onClick={confirmTuning}>确认并保存这组参数</button>
          {saveNotice && <p className="tune-save-notice" role="status">{saveNotice}</p>}
        </aside>
      )}

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
