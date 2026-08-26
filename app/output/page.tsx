"use client";

import { useEffect, useState } from "react";
import {
  AssistantCharacter,
  defaultAssistantTuning,
  type AssistantState,
  type AssistantTuning,
} from "../components/AssistantCharacter";

const outputStates: { value: AssistantState; label: string }[] = [
  { value: "idle", label: "Idle" },
  { value: "listening", label: "Listening" },
  { value: "understanding", label: "Understanding" },
  { value: "thinking", label: "Thinking" },
  { value: "searching", label: "Searching" },
  { value: "generating", label: "Generating" },
  { value: "tool-calling", label: "Tool Calling" },
  { value: "success", label: "Success" },
  { value: "error", label: "Error" },
  { value: "waiting", label: "Waiting" },
];

const projects = [
  "Fabric 设计风格探索",
  "帮我构建一个移动端个人网站设计师",
  "UI设计师设计规范版本迭代文案测试",
  "Fabric 设计风格探索",
];

const news = [
  ["1. 英伟达 Q2 财报即将揭晓，AI 行情走向备受关注", "市场将本次财报视为判断 AI 浪潮下一阶段的重要风向标，云厂商的基础设施投入和芯片需求仍是关注重点。"],
  ["2. OpenAI 推出更高效的智能体工作方式", "智能体进一步接入办公工具，在更长任务中完成检索、分析和内容生成，产品体验正从问答走向持续协作。"],
  ["3. 具身智能加速进入商业化阶段", "机器人融资、量产和真实场景测试持续升温，行业开始关注稳定交付能力与长期应用价值。"],
];

export default function OutputPreview() {
  const [state, setState] = useState<AssistantState>("idle");
  const [tunings, setTunings] = useState<Partial<Record<AssistantState, AssistantTuning>>>({});
  const tuning = tunings[state] ?? defaultAssistantTuning;

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("assistant-motion-tuning-by-state");
      if (saved) setTunings(JSON.parse(saved));
    } catch {
      setTunings({});
    }
  }, []);

  return (
    <main className="output-shell">
      <aside className="output-sidebar">
        <div className="output-windowbar">
          <div className="window-dots"><i /><i /><i /></div>
          <img src="/figma/qagent-logo.svg" alt="QAgent" />
          <span>QAgent Fabric v0.3.3</span>
        </div>
        <button className="new-task" type="button"><img src="/figma/add-task.svg" alt="" />新建任务</button>
        <section className="project-section">
          <p>项目列表</p>
          {projects.map((project, index) => (
            <button type="button" key={`${project}-${index}`} className={index === 2 ? "selected" : ""}>
              <img src="/figma/conversation.svg" alt="" /><span>{project}</span><small>5d</small>
            </button>
          ))}
        </section>
        <section className="project-section global-list">
          <p>全局任务</p>
          {projects.concat(["优化网站设计风格", "Fabric 设计风格探索第三版"]).map((project, index) => (
            <button type="button" key={`${project}-global-${index}`}>
              <img src="/figma/conversation.svg" alt="" /><span>{project}</span><small>5d</small>
            </button>
          ))}
        </section>
        <div className="sidebar-bottom">
          <button type="button" className="selected">◉ Fabric 专家团</button>
          <button type="button">▣ 归档任务</button>
          <button type="button">⌘ 技能商店</button>
          <a href="/">返回动效实验室</a>
        </div>
      </aside>

      <section className="output-workspace">
        <nav className="output-state-switcher" aria-label="Assistant 状态预览">
          {outputStates.map((item) => (
            <button type="button" key={item.value} className={state === item.value ? "active" : ""} onClick={() => setState(item.value)}>{item.label}</button>
          ))}
        </nav>
        <div className="output-toolbar"><span>访达⌄</span><span>▱</span></div>
        <div className="output-scroll">
          <div className="user-message">帮我查找今天五条最重要的 AI 讯息</div>
          <article className="assistant-response">
            <header className="response-author">
              <div className="output-avatar" aria-hidden="true">
                <AssistantCharacter state={state} tuning={tuning} label={`${state} Assistant`} />
              </div>
              <div><strong>Fabric 产品经理</strong><span>{outputStates.find((item) => item.value === state)?.label}</span></div>
            </header>
            <div className="elapsed">耗时 8s <img src="/figma/arrow-right.svg" alt="" /></div>
            <p className="response-summary">我已整理今天的重要 AI 新闻，并结合来源广度、时效性和影响力完成摘要。下面是今天最受关注的人工智能新闻总结。</p>
            <h1>今日 AI 热点 Top 5</h1>
            <div className="news-list">
              {news.map(([title, copy]) => <section key={title}><h2>{title}</h2><p>{copy}</p></section>)}
            </div>
          </article>
        </div>
        <div className="output-composer-wrap">
          <div className="output-composer">
            <p>描述你的任务，按 Enter 发送，Shift+Enter 换行</p>
            <div>
              <span className="composer-actions"><button type="button"><img src="/figma/add.svg" alt="" /></button><button type="button"><img src="/figma/experts.svg" alt="" />专家团<img src="/figma/chevron.svg" alt="" /></button><button type="button"><img src="/figma/approval.svg" alt="" />请求审批<img src="/figma/chevron.svg" alt="" /></button></span>
              <span className="composer-send">glm5.2 <img src="/figma/model-chevron.svg" alt="" /><button type="button"><img src="/figma/send.svg" alt="发送" /></button></span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
