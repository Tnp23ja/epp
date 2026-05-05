"use client"

import { useEffect, useMemo, useState, use } from "react"
import { createClient } from "@supabase/supabase-js"
import PdfViewer from "../../dashboard/components/PdfViewer"

export default function CatalogPage({ params }: { params: Promise<{ id: string }> }) {
  // unwrap params ด้วย use()
  const { id } = use(params)

  const supabase = useMemo(() => createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  ), [])

  const [pdfUrl, setPdfUrl] = useState<string | null>(null)

  useEffect(() => {
    // สร้าง URL จากชื่อไฟล์
    const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/catalogs/${id}`
    setPdfUrl(url)
  }, [id])

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-6">กระดาษแปะ</h1>
      {pdfUrl ? (
        <PdfViewer pdfUrl={pdfUrl} />
      ) : (
        <p className="text-gray-500">กำลังโหลด...</p>
      )}
    </main>
  )
}