export enum DeferredStatus {
  pending = 1,
  rejected = 2,
  fulfilled = 3,
  pause = 4
}
export class Deferred<T> {
  promise: Promise<T>;
  status: DeferredStatus = DeferredStatus.pending;
  resolve!: (value: T | PromiseLike<T>) => void;
  reject!: (reason?: any) => void;

  constructor() {
    this.promise = new Promise((resolve, reject) => {
      this.resolve = (...rest) => {
        resolve(...rest);
        this.status = DeferredStatus.fulfilled;
      };
      this.reject = (...rest) => {
        reject(...rest);
        this.status = DeferredStatus.rejected;
      };
    });
  }

  pause() {
    this.status = DeferredStatus.pause;
  }
}
