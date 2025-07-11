declare module 'react-credit-cards-2';
declare module 'qrcode.react';

declare namespace chrome {
  interface Storage {
    local: {
      get: (keys: string[], callback: (result: { [key: string]: any }) => void) => void;
      set: (items: { [key: string]: any }, callback?: () => void) => void;
    };
  }
  const storage: Storage;
  const runtime: any;
}
