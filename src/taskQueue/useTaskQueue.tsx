import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Deferred, DeferredStatus } from "../deferred";

const NOT_START_INDEX = -1;

enum TaskResult {
  Continue = 1,
  Fulfilled = 2
}

interface Task {
  name: string;
  job: () => Promise<TaskResult>;
  isPause: () => Promise<boolean>;
}

export function useTask(
  name: string,
  callback: (resolve, reject, fulfilled) => void,
  isPause
): Task {
  return useMemo(
    () => ({
      job: () =>
        new Promise((resolve, reject) => {
          callback(
            () => resolve(TaskResult.Continue),
            reject,
            () => resolve(TaskResult.Fulfilled)
          );
        }),
      name,
      isPause
    }),
    [name, callback, isPause]
  );
}

export const useQueue = (tasks: Task[]) => {
  const deferred = useRef(new Deferred<void>());
  const executeIndex = useRef(NOT_START_INDEX);
  const [nextExecuteIndex, setNextExecuteIndex] = useState(NOT_START_INDEX);
  const reset = useCallback(() => {
    executeIndex.current = NOT_START_INDEX;
    setNextExecuteIndex(NOT_START_INDEX);
    deferred.current = new Deferred();
  }, []);
  useEffect(() => {
    async function execute(index) {
      try {
        if (await tasks[index].isPause()) {
          return deferred.current.pause();
        }
        const taskResult = await tasks[index].job();
        if (taskResult === TaskResult.Fulfilled) {
          deferred.current.resolve();
          reset();
          return;
        }
        if (index + 1 < tasks.length) {
          setNextExecuteIndex(index + 1);
        } else {
          deferred.current.resolve();
          reset();
        }
      } catch (e) {
        deferred.current.reject(e);
        reset();
      }
    }
    if (
      nextExecuteIndex >= 0 &&
      nextExecuteIndex < tasks.length &&
      (nextExecuteIndex !== executeIndex.current ||
        deferred.current.status === DeferredStatus.pause) &&
      ![DeferredStatus.rejected, DeferredStatus.fulfilled].includes(
        deferred.current.status
      )
    ) {
      if (deferred.current.status === DeferredStatus.pause) {
        deferred.current.status = DeferredStatus.pending;
      }
      execute(nextExecuteIndex);
      executeIndex.current = nextExecuteIndex;
    }
  }, [nextExecuteIndex, tasks, reset]);

  return useCallback(() => {
    setNextExecuteIndex(0);
    return deferred.current.promise;
  }, []);
};
