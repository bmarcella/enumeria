/* eslint-disable @typescript-eslint/no-explicit-any */
declare module 'exif-js' {
    const EXIF: {
      getData(img: any, callback: () => void): void;
      getTag(img: any, tag: string): any;
    };
    export default EXIF;
  }
  