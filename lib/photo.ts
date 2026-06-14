import { createCanvas, loadImage } from "@napi-rs/canvas";
import type { AttendanceType } from "@/lib/types";

export interface OverlayInput {
  originalPhoto: Buffer;
  employeeName: string;
  employeeId: string;
  attendanceType: AttendanceType;
  date: string;
  time: string;
  latitude: number;
  longitude: number;
  address: string;
  branch: string;
  verificationId: string;
}

export async function createVerificationImage(input: OverlayInput) {
  const image = await loadImage(input.originalPhoto);
  const canvas = createCanvas(image.width, image.height);
  const ctx = canvas.getContext("2d");
  ctx.drawImage(image, 0, 0);

  const padding = Math.max(24, Math.round(image.width * 0.025));
  const boxWidth = Math.min(image.width - padding * 2, Math.round(image.width * 0.72));
  const lineHeight = Math.max(28, Math.round(image.width * 0.026));
  const lines = [
    input.employeeName,
    `Employee ID: ${input.employeeId}`,
    input.attendanceType,
    input.date,
    input.time,
    input.address,
    `Lat: ${input.latitude.toFixed(6)}`,
    `Lng: ${input.longitude.toFixed(6)}`,
    `Branch: ${input.branch}`,
    `Verification ID: ${input.verificationId}`
  ];

  const boxHeight = padding * 2 + lines.length * lineHeight;
  const x = padding;
  const y = image.height - boxHeight - padding;
  ctx.fillStyle = "rgba(17,17,17,0.78)";
  ctx.fillRect(x, y, boxWidth, boxHeight);
  ctx.strokeStyle = "#FCEFA2";
  ctx.lineWidth = 4;
  ctx.strokeRect(x, y, boxWidth, boxHeight);

  lines.forEach((line, index) => {
    ctx.fillStyle = index === 2 ? "#FFBF60" : "#FFFFFF";
    ctx.font = `${index === 2 ? "800" : "700"} ${Math.max(22, Math.round(image.width * 0.02))}px Arial`;
    ctx.fillText(line, x + padding, y + padding + lineHeight * (index + 0.8), boxWidth - padding * 2);
  });

  return canvas.toBuffer("image/jpeg", 0.9);
}

export function dataUrlToBuffer(dataUrl: string) {
  const base64 = dataUrl.split(",")[1];
  if (!base64) throw new Error("Invalid photo data.");
  return Buffer.from(base64, "base64");
}
