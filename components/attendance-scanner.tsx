"use client";

import { useEffect, useRef, useState } from "react";
import jsQR from "jsqr";
import { Camera, MapPin, QrCode, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, Select } from "@/components/ui/input";
import { formatDeviceInfo } from "@/lib/utils";
import type { AttendanceType, Employee } from "@/lib/types";

type EmployeePreview = Pick<Employee, "employee_id" | "full_name" | "email" | "profile_photo_url" | "branch_name">;

export function AttendanceScanner() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scanRef = useRef<HTMLCanvasElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [manualId, setManualId] = useState("");
  const [branch, setBranch] = useState("");
  const [status, setStatus] = useState("Start camera to scan attendance.");
  const [employee, setEmployee] = useState<EmployeePreview | null>(null);
  const [lastResult, setLastResult] = useState<{ type: AttendanceType; verificationId: string } | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    return () => stream?.getTracks().forEach((track) => track.stop());
  }, [stream]);

  useEffect(() => {
    if (!stream) return;
    const timer = window.setInterval(scanFrame, 700);
    return () => window.clearInterval(timer);
  }, [stream, busy]);

  async function startCamera() {
    try {
      const cameraStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false
      });
      if (videoRef.current) {
        videoRef.current.srcObject = cameraStream;
        await videoRef.current.play();
      }
      setStream(cameraStream);
      setStatus("Camera ready. Scan QR or enter ID manually.");
    } catch {
      setStatus("Camera permission is required before attendance can be accepted.");
    }
  }

  function stopCamera() {
    stream?.getTracks().forEach((track) => track.stop());
    setStream(null);
    if (videoRef.current) videoRef.current.srcObject = null;
    setStatus("Camera stopped.");
  }

  function scanFrame() {
    if (busy || !videoRef.current || videoRef.current.readyState < 2) return;
    const video = videoRef.current;
    const canvas = scanRef.current || document.createElement("canvas");
    scanRef.current = canvas;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const result = jsQR(data.data, data.width, data.height, { inversionAttempts: "attemptBoth" });
    if (result?.data) {
      submitAttendance(result.data);
    }
  }

  function capturePhoto() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) throw new Error("Camera evidence photo is required.");
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Camera canvas is not available.");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.9);
  }

  function getGps() {
    return new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      });
    });
  }

  async function submitAttendance(code: string) {
    if (busy) return;
    setBusy(true);
    try {
      if (!stream) throw new Error("Camera is required.");
      const photoDataUrl = capturePhoto();
      const position = await getGps();
      setStatus("Saving attendance evidence...");

      const response = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          branch,
          device: formatDeviceInfo(),
          photoDataUrl,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        })
      });

      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Attendance was rejected.");
      setEmployee(payload.employee);
      setLastResult({ type: payload.attendanceType, verificationId: payload.verificationId });
      setStatus(`${payload.employee.full_name} ${payload.attendanceType} recorded.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Attendance failed.");
    } finally {
      window.setTimeout(() => setBusy(false), 2200);
    }
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_380px]">
      <Card>
        <CardHeader>
          <div>
            <p className="text-xs font-black uppercase text-brand-hill">Attendance Scanner</p>
            <CardTitle>QR / ID Attendance</CardTitle>
          </div>
          <ShieldCheck className="text-brand-hill" />
        </CardHeader>
        <div className="relative overflow-hidden rounded-ui bg-brand-dark">
          <video ref={videoRef} muted playsInline className="aspect-video w-full object-cover" />
          <div className="absolute inset-0 grid place-items-center">
            <div className="h-64 w-64 rounded-ui border-4 border-brand-orange shadow-[0_0_0_999px_rgba(0,0,0,0.22)]" />
          </div>
          <div className="absolute bottom-4 left-4 right-4 rounded-ui bg-white/95 p-3 text-sm font-bold">{status}</div>
        </div>
        <canvas ref={canvasRef} hidden />
        <div className="mt-4 grid gap-3 md:grid-cols-[1fr_1fr_auto_auto]">
          <Label>
            Branch / Site
            <Select value={branch} onChange={(event) => setBranch(event.target.value)}>
              <option value="">Default branch</option>
              <option value="Kantibas, Cebu">Kantibas, Cebu</option>
              <option value="Main Office">Main Office</option>
            </Select>
          </Label>
          <Label>
            Manual Employee ID
            <Input value={manualId} onChange={(event) => setManualId(event.target.value)} placeholder="EMP-001" />
          </Label>
          <Button type="button" onClick={() => manualId && submitAttendance(manualId)}>Submit ID</Button>
          <Button type="button" variant="outline" onClick={stream ? stopCamera : startCamera}>
            {stream ? "Stop" : "Start Camera"}
          </Button>
        </div>
      </Card>

      <div className="grid gap-5">
        <Card>
          <CardHeader>
            <CardTitle>Employee</CardTitle>
            <QrCode className="text-brand-hill" />
          </CardHeader>
          {employee ? (
            <div className="grid gap-3">
              {employee.profile_photo_url ? <img src={employee.profile_photo_url} alt="" className="h-56 w-full rounded-ui object-cover" /> : null}
              <strong className="text-2xl text-brand-dark">{employee.full_name}</strong>
              <span className="font-bold text-slate-600">{employee.employee_id}</span>
              <span>{employee.email}</span>
              <span>{employee.branch_name}</span>
            </div>
          ) : (
            <p className="text-slate-500">Profile appears after scan.</p>
          )}
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Last Result</CardTitle>
            <Camera className="text-brand-hill" />
          </CardHeader>
          {lastResult ? (
            <div className="grid gap-2">
              <span className="w-max rounded-full bg-brand-lime px-3 py-1 text-xs font-black">{lastResult.type}</span>
              <strong>{lastResult.verificationId}</strong>
              <p className="text-sm text-slate-500">Photo evidence, timestamp, and GPS were saved automatically.</p>
            </div>
          ) : (
            <p className="text-slate-500">Waiting for attendance.</p>
          )}
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Validation</CardTitle>
            <MapPin className="text-brand-hill" />
          </CardHeader>
          <p className="text-sm text-slate-600">Camera, GPS, employee validation, photo upload, and verification overlay are required before saving.</p>
        </Card>
      </div>
    </div>
  );
}
