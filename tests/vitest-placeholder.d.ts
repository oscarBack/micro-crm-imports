declare module "vitest" {
  export const describe: {
    skip: (name: string, suite: () => void) => void;
  };

  export const it: (name: string, test: () => void | Promise<void>) => void;

  export const expect: <T>(value: T) => {
    toEqual: (expected: unknown) => void;
  };
}
