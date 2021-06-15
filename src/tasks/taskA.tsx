import { useRef, useEffect, useCallback, useState } from "react";
import { useDialog } from "../dialog/Service";
import { useTask } from "../taskQueue/useTaskQueue";
import { useSharedLocalStorage, sleep, KEY } from "../util";

export const useTaskA = () => {
  const dialog = useDialog();
  const [value, setValue] = useSharedLocalStorage(KEY, false);
  const job = useCallback(
    async (resolve, reject, fulfilled) => {
      try {
        await dialog({
          variant: "confirm",
          catchOnCancel: false,
          title: "I am task A",
          description: "Click Submit to continue, and Cancel to reject."
        });
        resolve();
      } catch (e) {
        reject(e);
      }
    },
    [dialog]
  );

  const task = useTask("taskA", job, () => Promise.resolve(false));
  return task;
};
