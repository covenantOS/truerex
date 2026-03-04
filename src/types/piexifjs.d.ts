declare module "piexifjs" {
  interface GPSIFD {
    GPSLatitudeRef: number;
    GPSLatitude: number;
    GPSLongitudeRef: number;
    GPSLongitude: number;
  }

  const GPSIFD: GPSIFD;

  function load(data: string): Record<string, Record<string, unknown>>;
  function dump(exifObj: Record<string, Record<string, unknown>>): string;
  function insert(exifStr: string, dataUrl: string): string;

  export { GPSIFD, load, dump, insert };
  export default { GPSIFD, load, dump, insert };
}
