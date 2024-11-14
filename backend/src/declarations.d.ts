// src/declarations.d.ts

declare module 'winston-daily-rotate-file' {
    import Transport from 'winston-transport';
  
    interface DailyRotateFileTransportOptions extends Transport.TransportStreamOptions {
      filename: string;
      datePattern?: string;
      zippedArchive?: boolean;
      maxSize?: string;
      maxFiles?: string | number;
    }
  
    class DailyRotateFile extends Transport {
      constructor(opts: DailyRotateFileTransportOptions);
    }
  
    export = DailyRotateFile;
  }
  