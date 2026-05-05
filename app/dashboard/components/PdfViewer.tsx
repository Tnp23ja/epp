"use client";

import { useEffect, useRef, useState } from "react";

interface PdfViewerProps {
  pdfUrl: string; // URL ของไฟล์ PDF
  onSizeReady?: (width: number, height: number) => void // เพิ่มตรงนี้
}

export default function PdfViewer({ pdfUrl, onSizeReady }: PdfViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pageCount, setPageCount] = useState(0); // จำนวนหน้าทั้งหมด
  const [currentPage, setCurrentPage] = useState(1); // หน้าปัจจุบัน
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  let cancelled = false // ตัวแปรเช็คว่า component ถูกปิดไปแล้วมั้ย

  const renderPage = async () => {
    setLoading(true)

    const pdfjsLib = await import("pdfjs-dist")
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`

    const pdf = await pdfjsLib.getDocument(pdfUrl).promise
    if (cancelled) return // ถ้าปิดไปแล้วให้หยุด

    setPageCount(pdf.numPages)

    const page = await pdf.getPage(currentPage)
    if (cancelled) return // เช็คอีกรอบ

    const viewport = page.getViewport({ scale: 1.5 })
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.width = viewport.width
    canvas.height = viewport.height

    // ส่งขนาดออกไปให้ parent รู้
    if (onSizeReady) {
        onSizeReady(viewport.width, viewport.height)
    }

    const context = canvas.getContext("2d")
    if (!context) return

    // ล้าง canvas ก่อน render ใหม่
    context.clearRect(0, 0, canvas.width, canvas.height)

    await page.render({
      canvasContext: context as any,
      viewport: viewport,
      canvas: canvas
    }).promise

    if (!cancelled) setLoading(false)
  }

  renderPage()

  // cleanup เมื่อ component ถูกปิดหรือ render ใหม่
  return () => {
    cancelled = true
  }
}, [pdfUrl, currentPage])

  return (
    <div className="flex flex-col items-center gap-4">
      {/* แสดง loading */}
      {loading && <p className="text-gray-500">กำลังโหลด...</p>}

      {/* canvas แสดง PDF */}
      <canvas
        ref={canvasRef}
        className="border rounded-lg shadow-md max-w-full"
      />

      {/* ปุ่มเปลี่ยนหน้า */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          className="bg-gray-200 px-4 py-2 rounded-lg disabled:opacity-50"
        >
          ← ก่อนหน้า
        </button>
        <span className="text-gray-600">
          หน้า {currentPage} / {pageCount}
        </span>
        <button
          onClick={() => setCurrentPage((p) => Math.min(pageCount, p + 1))}
          disabled={currentPage === pageCount}
          className="bg-gray-200 px-4 py-2 rounded-lg disabled:opacity-50"
        >
          ถัดไป →
        </button>
      </div>
    </div>
  );
}
