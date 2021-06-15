import {
  Dispatch,
  SetStateAction,
  useCallback,
  useState,
  useRef,
  useLayoutEffect,
  useEffect
} from "react";

type parserOptions<T> =
  | { raw: true }
  | {
      raw: false;
      serializer: (value: T) => string;
      deserializer: (value: string) => T;
    };

export const useSharedLocalStorage = <T>(
  key: string,
  initialValue?: T,
  options?: parserOptions<T>
): [T | undefined, Dispatch<SetStateAction<T | undefined>>, () => void] => {
  if (!key) {
    throw new Error("useLocalStorage key may not be falsy");
  }

  const deserializer = options
    ? options.raw
      ? (value) => value
      : options.deserializer
    : JSON.parse;
  const serializer = options
    ? options.raw
      ? String
      : options.serializer
    : JSON.stringify;

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const initializer = useRef((key: string) => {
    try {
      const localStorageValue = localStorage.getItem(key);
      if (localStorageValue !== null) {
        return deserializer(localStorageValue);
      } else {
        initialValue && localStorage.setItem(key, serializer(initialValue));
        return initialValue;
      }
    } catch {
      // If user is in private mode or has storage restriction
      // localStorage can throw. JSON.parse and JSON.stringify
      // can throw, too.
      return initialValue;
    }
  });

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [state, setState] = useState<T | undefined>(() =>
    initializer.current(key)
  );

  const setStateAll = useCallback(
    (value) => {
      setState(value);
      storageKeysUsed
        .get(localStorage)
        ?.get(key)
        ?.forEach((setter) => {
          if (setter === setState) return;
          setter(value);
        });
    },
    [setState, key]
  );
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useLayoutEffect(() => setState(initializer.current(key)), [key]);

  useEffect(() => {
    const handler = (ev: StorageEvent) => {
      if (ev.storageArea === localStorage && ev.storageArea.length === 0)
        return setState(initialValue);
      if (
        ev.storageArea !== localStorage ||
        key !== ev.key ||
        ev.newValue === serializer(state)
      )
        return;
      const value = ev.newValue ? deserializer(ev.newValue) : ev.newValue;
      setState(value);
    };
    window.addEventListener("storage", handler, { passive: true });
    return () => window.removeEventListener("storage", handler);
  }, [key]);

  useEffect(() => {
    let storageKeys = storageKeysUsed.get(localStorage);

    if (!storageKeys) {
      storageKeys = new Map();
      storageKeysUsed.set(localStorage, storageKeys);
    }

    let keySetters = storageKeys.get(key);

    if (!keySetters) {
      keySetters = new Set();
      storageKeys.set(key, keySetters);
    }

    const mSetState = setState;
    keySetters.add(mSetState);

    return () => {
      keySetters?.delete(mSetState);
    };
  }, [key]);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const set: Dispatch<SetStateAction<T | undefined>> = useCallback(
    (valOrFunc) => {
      try {
        const newState =
          typeof valOrFunc === "function"
            ? (valOrFunc as Function)(state)
            : valOrFunc;
        if (typeof newState === "undefined") return;
        let value: string;

        if (options)
          if (options.raw)
            if (typeof newState === "string") value = newState;
            else value = JSON.stringify(newState);
          else if (options.serializer) value = options.serializer(newState);
          else value = JSON.stringify(newState);
        else value = JSON.stringify(newState);

        localStorage.setItem(key, value);
        setStateAll(deserializer(value));
      } catch {
        // If user is in private mode or has storage restriction
        // localStorage can throw. Also JSON.stringify can throw.
      }
    },
    [key, setState]
  );

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const remove = useCallback(() => {
    try {
      localStorage.removeItem(key);
      setStateAll(initialValue);
    } catch {
      // If user is in private mode or has storage restriction
      // localStorage can throw.
    }
  }, [key, setState]);

  return [state, set, remove];
};

const storageKeysUsed = new Map<Storage, Map<string, Set<CallableFunction>>>();

export const sleep = (time) =>
  new Promise<void>((resolve) =>
    setTimeout(() => {
      resolve();
    }, time)
  );

export const KEY = "testkey";
