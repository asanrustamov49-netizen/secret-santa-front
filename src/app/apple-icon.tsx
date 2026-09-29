import { brandIcon } from "@/lib/brand/brandIcon";

// iPhone / iPad home screen. iOS fills transparency with black and rounds the corners itself,
// so the mark sits on the night-sky square with some breathing room.

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return brandIcon({ size: size.width, plate: "square", markScale: 0.72 });
}
