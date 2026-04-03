import { QRCodeSVG } from 'qrcode.react';

export function QRCode({ value, size = 128 }: { value: string; size?: number }) {
  return (
    <div className="inline-block rounded-md border border-slate-200 bg-white p-2">
      <QRCodeSVG value={value} size={size} fgColor="#0f172a" bgColor="#ffffff" />
    </div>
  );
}