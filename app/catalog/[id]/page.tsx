"use client"

import { useEffect, useMemo, useState, use } from "react"
import { createClient } from "@supabase/supabase-js"
import PdfViewer from "../../dashboard/components/PdfViewer"
import HotspotViewer from "./components/HotspotViewer"

export default function CatalogPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  const supabase = useMemo(() => createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  ), [])

  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [hotspots, setHotspots] = useState<any[]>([])
  const [pdfSize, setPdfSize] = useState({ width: 0, height: 0 })
  const [currentPage, setCurrentPage] = useState(1) // เพิ่ม state หน้าปัจจุบัน

  useEffect(() => {
    // สร้าง URL ของ PDF
    const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/catalogs/${id}`
    setPdfUrl(url)

    // ดึง hotspots ของ catalog นี้จาก Supabase
    const fetchHotspots = async () => {
      const { data, error } = await supabase
        .from("hotspots")
        .select("*")
        .eq("catalog_name", id) // กรองเฉพาะ catalog นี้
      
      if (!error && data) {
        setHotspots(data)
      }
    }

    fetchHotspots()
  }, [id])

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-6">กระดาษแปะ</h1>

      {/* PDF + Hotspot ซ้อนทับกัน */}
      <div style={{ position: "relative", display: "inline-block" }}>
        {pdfUrl && (
          <PdfViewer
            pdfUrl={pdfUrl}
            onSizeReady={(w, h) => setPdfSize({ width: w, height: h })}
            onPageChange={(page) => setCurrentPage(page)} // เพิ่มตรงนี้
          />
        )}

        {/* แสดง hotspot ทับบน PDF */}
        {pdfSize.width > 0 && (
          <HotspotViewer
            width={pdfSize.width}
            height={pdfSize.height}
            hotspots={hotspots.filter(h => h.page === currentPage)} // กรองตามหน้า
          />
        )}
      </div>
    </main>
  )
}