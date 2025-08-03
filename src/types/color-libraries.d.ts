declare module "nearest-color" {
  interface ColorResult {
    name: string;
    value: string;
    rgb: { r: number; g: number; b: number };
    distance: number;
  }

  interface NearestColor {
    (color: string): ColorResult | null;
    from(colors: {
      [key: string]: string;
    }): (color: string) => ColorResult | null;
  }

  const nearestColor: NearestColor;
  export default nearestColor;
}

declare module "color-name-list" {
  interface ColorItem {
    name: string;
    hex: string;
  }

  const colorNameList: ColorItem[];
  export default colorNameList;
}
