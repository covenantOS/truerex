import piexif from "piexifjs";

interface GeoCoords {
  lat: number;
  lng: number;
}

function toDegreesMinutesSeconds(decimal: number): [[number, number], [number, number], [number, number]] {
  const absolute = Math.abs(decimal);
  const degrees = Math.floor(absolute);
  const minutesFloat = (absolute - degrees) * 60;
  const minutes = Math.floor(minutesFloat);
  const seconds = Math.round((minutesFloat - minutes) * 60 * 100);

  return [
    [degrees, 1],
    [minutes, 1],
    [seconds, 100],
  ];
}

export async function geoTagPhoto(
  file: File,
  coords: GeoCoords
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const dataUrl = reader.result as string;
        let exifObj: Record<string, Record<string, unknown>>;

        try {
          exifObj = piexif.load(dataUrl);
        } catch {
          exifObj = { "0th": {}, Exif: {}, GPS: {}, "1st": {} };
        }

        // Set GPS data
        exifObj.GPS = exifObj.GPS || {};
        exifObj.GPS[piexif.GPSIFD.GPSLatitudeRef] = coords.lat >= 0 ? "N" : "S";
        exifObj.GPS[piexif.GPSIFD.GPSLatitude] = toDegreesMinutesSeconds(coords.lat);
        exifObj.GPS[piexif.GPSIFD.GPSLongitudeRef] = coords.lng >= 0 ? "E" : "W";
        exifObj.GPS[piexif.GPSIFD.GPSLongitude] = toDegreesMinutesSeconds(coords.lng);

        const exifStr = piexif.dump(exifObj);
        const newDataUrl = piexif.insert(exifStr, dataUrl);

        // Convert data URL to blob
        const byteString = atob(newDataUrl.split(",")[1]);
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }
        resolve(new Blob([ab], { type: "image/jpeg" }));
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function readExifCoords(file: File): Promise<GeoCoords | null> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const dataUrl = reader.result as string;
        const exifObj = piexif.load(dataUrl);

        if (!exifObj.GPS || !exifObj.GPS[piexif.GPSIFD.GPSLatitude]) {
          resolve(null);
          return;
        }

        const latDms = exifObj.GPS[piexif.GPSIFD.GPSLatitude] as [number, number][];
        const latRef = exifObj.GPS[piexif.GPSIFD.GPSLatitudeRef] as string;
        const lngDms = exifObj.GPS[piexif.GPSIFD.GPSLongitude] as [number, number][];
        const lngRef = exifObj.GPS[piexif.GPSIFD.GPSLongitudeRef] as string;

        const lat =
          (latDms[0][0] / latDms[0][1] +
            latDms[1][0] / latDms[1][1] / 60 +
            latDms[2][0] / latDms[2][1] / 3600) *
          (latRef === "S" ? -1 : 1);

        const lng =
          (lngDms[0][0] / lngDms[0][1] +
            lngDms[1][0] / lngDms[1][1] / 60 +
            lngDms[2][0] / lngDms[2][1] / 3600) *
          (lngRef === "W" ? -1 : 1);

        resolve({ lat, lng });
      } catch {
        resolve(null);
      }
    };
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
}
