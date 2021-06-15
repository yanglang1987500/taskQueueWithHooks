import { useRef, useEffect, useCallback, useState } from "react";
import { useDialog } from "../dialog/Service";
import { useTask } from "../taskQueue/useTaskQueue";
import { useSharedLocalStorage, sleep, KEY } from "../util";

export const useTaskB = () => {
  const dialog = useDialog();
  const [value, setValue] = useSharedLocalStorage(KEY, false);
  const job = useCallback(
    async (resolve, reject, fulfilled) => {
      try {
        await dialog({
          variant: "confirm",
          catchOnCancel: false,
          title: "I am task B",
          description: "Click Submit to fulfilled, and Cancel to reject."
        });
        fulfilled();
      } catch (e) {
        reject(e);
      }
    },
    [dialog]
  );

  const task = useTask("taskB", job, () => Promise.resolve(false));
  return task;
};
