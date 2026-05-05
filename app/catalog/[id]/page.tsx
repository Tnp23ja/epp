"use client";

import { useEffect, useMemo, useState, use } from "react";
import { createClient } from "@supabase/supabase-js";
import PdfViewer from "../../dashboard/components/PdfViewer";
import HotspotViewer from "./components/HotspotViewer";

export default function CatalogPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const supabase = useMemo(
    () =>
      createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      ),
    [],
  );

  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [hotspots, setHotspots] = useState<any[]>([]);
  const [pdfSize, setPdfSize] = useState({ width: 0, height: 0 });
  const [currentPage, setInternalPage] = useState(1); // เพิ่ม state หน้าปัจจุบัน
  const [pageCount, setPageCount] = useState(0); // เพิ่มตรงนี้

  useEffect(() => {
    // สร้าง URL ของ PDF
    const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/catalogs/${id}`;
    setPdfUrl(url);

    // ดึง hotspots ของ catalog นี้จาก Supabase
    const fetchHotspots = async () => {
      const { data, error } = await supabase
        .from("hotspots")
        .select("*")
        .eq("catalog_name", id); // กรองเฉพาะ catalog นี้

      if (!error && data) {
        setHotspots(data);
      }
    };

    fetchHotspots();
  }, [id]);

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-6">กระดาษแปะ</h1>

      {/* PDF + Hotspot ซ้อนทับกัน */}
      <div
        style={{
          position: "relative",
          display: "inline-block",
          touchAction: "pan-y",
        }}
      >
        {pdfUrl && (
          <PdfViewer
            pdfUrl={pdfUrl}
            onSizeReady={(w, h) => setPdfSize({ width: w, height: h })}
            onPageChange={(page) => setInternalPage(page)}
            onPageCountReady={(count) => setPageCount(count)} // เพิ่มตรงนี้
            hidePagination={true}
            currentPage={currentPage}
          />
        )}
        {pdfSize.width > 0 && (
          <HotspotViewer
            width={pdfSize.width}
            height={pdfSize.height}
            hotspots={hotspots.filter((h) => h.page === currentPage)}
          />
        )}
      </div>

      {/* ปุ่มอยู่นอก div แยกต่างหาก Stage ไม่บัง */}
      <div className="flex items-center gap-4 mt-4">
        <button
          onClick={() => {
            const newPage = Math.max(1, currentPage - 1);
            setInternalPage(newPage);
          }}
          className="bg-white text-black border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-100"
        >
          ← ก่อนหน้า
        </button>
        <span className="text-white">หน้า {currentPage}</span>
        <button
          onClick={() => {
            const newPage = Math.min(pageCount, currentPage + 1); // ไม่เกิน pageCount
            setInternalPage(newPage);
          }}
          className="bg-white text-black border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-100"
        >
          ถัดไป →
        </button>
      </div>
    </main>
  );
}
