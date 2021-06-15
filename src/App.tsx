import "./styles.css";
import { useRef, useEffect, useCallback, useState, useMemo } from "react";
import { useSharedLocalStorage, sleep, KEY } from "./util";
import { useQueue } from "./taskQueue/useTaskQueue";
import { useTaskA } from "./tasks/taskA";
import { useTaskB } from "./tasks/taskB";
import { useTaskC } from "./tasks/taskC";

export const useTest = () => {
  const taskA = useTaskA();
  const taskB = useTaskB();
  const taskC = useTaskC();
  const tasks = useMemo(() => [taskA, taskB, taskC], [taskA, taskB, taskC]);
  const queue = useQueue(tasks);
  useEffect(() => {
    (async () => {
      try {
        await queue();
      } catch (e) {
        console.error("reject", e);
      }
    })();
  }, [queue]);
};

export default function App() {
  useTest();
  return (
    <div className="App">
      <h1>Hello CodeSandbox</h1>
      <h2>Start editing to see some magic happen!</h2>
    </div>
  );
}
