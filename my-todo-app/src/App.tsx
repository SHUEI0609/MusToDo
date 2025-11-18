import { useState, useMemo, useEffect } from "react";
import type { ChangeEvent } from "react";
import { SuggestionInput } from "./SuggestionInput";
import "./App.css";

// ステータスの型定義
const STATUSES = [
  "未着手",
  "譜面確認中",
  "個人練習中",
  "バンド練習中",
  "完成",
] as const;
type Status = typeof STATUSES[number];

// リンクの型定義
interface Links {
  youtube: string;
  sheet: string;
  audio: string;
}

// タスク（曲）の型定義
interface Task {
  id: number;
  title: string;
  event: string;
  deadline: string;
  status: Status;
  links: Links;
  memo: string;
}

function App() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const savedTasks = localStorage.getItem("tasks");
    return savedTasks ? JSON.parse(savedTasks) : [];
  });

  const [isFormVisible, setIsFormVisible] = useState(false);
  const [showCompleted, setShowCompleted] = useState<Record<string, boolean>>({});
  const [title, setTitle] = useState("");
  const [event, setEvent] = useState("");
  const [deadline, setDeadline] = useState("");
  const [links, setLinks] = useState<Links>({ youtube: "", sheet: "", audio: "" });
  const [memo, setMemo] = useState("");

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  const currentEventNames = useMemo(() => {
    const eventSet = new Set(tasks.map(task => task.event).filter(Boolean)); // filter(Boolean) to remove empty strings
    return Array.from(eventSet);
  }, [tasks]);



  const resetForm = () => {
    setTitle("");
    setEvent("");
    setDeadline("");
    setLinks({ youtube: "", sheet: "", audio: "" });
    setMemo("");
    setIsFormVisible(false);
  };

  const addTask = () => {
    if (title.trim() === "") {
      alert("曲名は必須です。");
      return;
    }
    const newTask: Task = {
      id: Date.now(),
      title,
      event: event || "指定なし", // イベントが空ならデフォルト値
      deadline,
      status: "未着手",
      links,
      memo,
    };
    setTasks((prev) => [...prev, newTask]);
    resetForm();
  };

  const deleteTask = (id: number) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  const updateStatus = (id: number, newStatus: Status) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, status: newStatus } : task))
    );
  };

  const handleLinkChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLinks((prev) => ({ ...prev, [name]: value }));
  };

  const groupedTasks = useMemo(() => {
    return tasks.reduce((acc, task) => {
      const eventName = task.event || "指定なし";
      if (!acc[eventName]) {
        acc[eventName] = { incomplete: [], completed: [] };
      }
      if (task.status === '完成') {
        acc[eventName].completed.push(task);
      } else {
        acc[eventName].incomplete.push(task);
      }
      return acc;
    }, {} as Record<string, { incomplete: Task[], completed: Task[] }>);
  }, [tasks]);

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Band Practice Tracker</h1>
      </header>

      <main className="app-main">
        <div className="task-list-container">
          {Object.entries(groupedTasks).map(([eventName, eventTasks]) => (
            <section key={eventName} className="event-section">
              <h2 className="event-title">{eventName}</h2>
              <ul className="task-list">
                {eventTasks.incomplete.map((task) => (
                  <li key={task.id} className={`task-item ${task.status === '完成' ? 'completed' : ''}`}>
                    <div className="task-content">
                      <button 
                        className="complete-button" 
                        onClick={() => updateStatus(task.id, task.status === '完成' ? '未着手' : '完成')}
                      >
                        <svg width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-2-9.59L15.59 12 10 17.59 6.41 14 7.83 12.59 10 14.77z"></path></svg>
                      </button>
                      <div className="task-details">
                        <p className="task-title">{task.title}</p>
                        {task.memo && <p className="task-memo">{task.memo}</p>}
                        <div className="task-meta">
                          {task.deadline && <span className="task-deadline">{task.deadline}</span>}
                          <div className="task-links">
                            {task.links.youtube && <a href={task.links.youtube} target="_blank" rel="noopener noreferrer">YouTube</a>}
                            {task.links.sheet && <a href={task.links.sheet} target="_blank" rel="noopener noreferrer">楽譜</a>}
                            {task.links.audio && <a href={task.links.audio} target="_blank" rel="noopener noreferrer">音源</a>}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="task-actions">
                       <select
                        value={task.status}
                        onChange={(e) => updateStatus(task.id, e.target.value as Status)}
                        className="status-select"
                      >
                        {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <button className="delete-button" onClick={() => deleteTask(task.id)}>
                        <svg width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"></path></svg>
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
              {eventTasks.completed.length > 0 && (
                <div className="completed-tasks-section">
                  <button 
                    className="completed-tasks-toggle"
                    onClick={() => setShowCompleted(prev => ({ ...prev, [eventName]: !prev[eventName] }))}
                  >
                    <span className={`toggle-arrow ${showCompleted[eventName] ? 'expanded' : ''}`}>▼</span>
                    完了済み {eventTasks.completed.length}件
                  </button>
                  {showCompleted[eventName] && (
                    <ul className="task-list completed-list">
                      {eventTasks.completed.map((task) => (
                        <li key={task.id} className={`task-item ${task.status === '完成' ? 'completed' : ''}`}>
                          <div className="task-content">
                            <button 
                              className="complete-button" 
                              onClick={() => updateStatus(task.id, task.status === '完成' ? '未着手' : '完成')}
                            >
                              <svg width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-2-9.59L15.59 12 10 17.59 6.41 14 7.83 12.59 10 14.77z"></path></svg>
                            </button>
                            <div className="task-details">
                              <p className="task-title">{task.title}</p>
                              {task.memo && <p className="task-memo">{task.memo}</p>}
                              <div className="task-meta">
                                {task.deadline && <span className="task-deadline">{task.deadline}</span>}
                                <div className="task-links">
                                  {task.links.youtube && <a href={task.links.youtube} target="_blank" rel="noopener noreferrer">YouTube</a>}
                                  {task.links.sheet && <a href={task.links.sheet} target="_blank" rel="noopener noreferrer">楽譜</a>}
                                  {task.links.audio && <a href={task.links.audio} target="_blank" rel="noopener noreferrer">音源</a>}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="task-actions">
                             <select
                              value={task.status}
                              onChange={(e) => updateStatus(task.id, e.target.value as Status)}
                              className="status-select"
                            >
                              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                            </select>
                            <button className="delete-button" onClick={() => deleteTask(task.id)}>
                              <svg width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"></path></svg>
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </section>
          ))}
        </div>

        {isFormVisible ? (
          <div className="task-input-form">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="曲名"
              className="task-input"
            />
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="メモ (例: Bメロのテンポ注意)"
              className="task-textarea"
            />
            <SuggestionInput
              value={event}
              onChange={setEvent}
              suggestions={currentEventNames}
              placeholder="イベント名"
            />
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="task-input"
            />
            <input
              type="url"
              name="youtube"
              value={links.youtube}
              onChange={handleLinkChange}
              placeholder="YouTube URL"
              className="task-input"
            />
            <input
              type="url"
              name="sheet"
              value={links.sheet}
              onChange={handleLinkChange}
              placeholder="楽譜/TAB譜 URL"
              className="task-input"
            />
            <input
              type="url"
              name="audio"
              value={links.audio}
              onChange={handleLinkChange}
              placeholder="音源 URL"
              className="task-input"
            />
            <div className="form-actions">
              <button onClick={addTask} className="add-button">タスクを追加</button>
              <button onClick={resetForm} className="cancel-button">キャンセル</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setIsFormVisible(true)} className="open-form-button">
            <svg width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"></path></svg>
            タスクを追加
          </button>
        )}
      </main>
    </div>
  );
}

export default App;