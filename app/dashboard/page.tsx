"use client";

import { useState, useMemo, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import PdfViewer from "./components/PdfViewer";
import HotspotEditor from "./components/HotspotEditor";

export default function Dashboard() {
  const supabase = useMemo(
    () =>
      createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      ),
    [],
  );

  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  // เก็บรายการไฟล์ทั้งหมดที่อัพโหลดไว้
  const [catalogs, setCatalogs] = useState<any[]>([]);
  // เก็บ hotspots ของแต่ละ catalog
  const [hotspots, setHotspots] = useState<any[]>([]);
  // เก็บว่ากำลังแก้ไข catalog ไหนอยู่
  const [editingCatalog, setEditingCatalog] = useState<string | null>(null);
  const [pdfSize, setPdfSize] = useState({ width: 0, height: 0 });

  // ดึงรายการไฟล์จาก Supabase ตอนโหลดหน้า
  const fetchCatalogs = async () => {
    const { data, error } = await supabase.storage.from("catalogs").list();

    if (!error && data) {
      setCatalogs(data);
    }
  };

  // เรียก fetchCatalogs ตอนหน้าโหลดครั้งแรก
  useEffect(() => {
    fetchCatalogs();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setMessage("");
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setMessage("");

    const fileName = `${Date.now()}_${file.name}`;

    const { error } = await supabase.storage
      .from("catalogs")
      .upload(fileName, file);

    if (error) {
      setMessage("อัพโหลดไม่สำเร็จ: " + error.message);
    } else {
      setMessage("อัพโหลดสำเร็จ!");
      setFile(null);
      fetchCatalogs(); // โหลดรายการใหม่หลังอัพโหลด
    }
    setUploading(false);
  };

  // สร้าง URL สำหรับเปิดไฟล์ PDF
  const getFileUrl = (fileName: string) => {
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/catalogs/${fileName}`;
  };

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-6">หลังบ้าน</h1>

      {/* กล่องอัพโหลด PDF */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center mb-8">
        <p className="text-gray-500 mb-4">อัพโหลด PDF ของคุณ</p>
        <input
          type="file"
          accept=".pdf"
          className="hidden"
          id="pdf-upload"
          onChange={handleFileChange}
        />
        <label
          htmlFor="pdf-upload"
          className="cursor-pointer bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600"
        >
          เลือกไฟล์ PDF
        </label>

        {file && (
          <div className="mt-4">
            <p className="text-gray-600">✓ {file.name}</p>
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="mt-4 bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 disabled:opacity-50"
            >
              {uploading ? "กำลังอัพโหลด..." : "อัพโหลด"}
            </button>
          </div>
        )}

        {message && (
          <p
            className={`mt-4 ${message.includes("สำเร็จ") ? "text-green-600" : "text-red-500"}`}
          >
            {message}
          </p>
        )}
      </div>

      {/* รายการ catalog ทั้งหมด */}
      <h2 className="text-xl font-bold mb-4">กระดาษแปะของคุณ</h2>
      {catalogs.length === 0 ? (
        <p className="text-gray-500">ยังไม่มี catalog</p>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {catalogs.map((catalog) => (
            <div key={catalog.name} className="border rounded-lg p-4">
              {/* ชื่อไฟล์ + ปุ่มต่างๆ */}
              <div className="flex justify-between items-center mb-4">
                <p className="font-medium">{catalog.name}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      setEditingCatalog(
                        editingCatalog === catalog.name ? null : catalog.name,
                      )
                    }
                    className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600"
                  >
                    {editingCatalog === catalog.name
                      ? "ปิด Editor"
                      : "วาง Hotspot"}
                  </button>
                  <button
                    onClick={() => {
                      const link = `${window.location.origin}/catalog/${catalog.name}`;
                      navigator.clipboard.writeText(link);
                      alert("คัดลอกลิงก์แล้ว!");
                    }}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                  >
                    แชร์ลิงก์
                  </button>
                </div>
              </div>

              {/* PDF + Hotspot Editor ซ้อนทับกัน */}
              <div style={{ position: "relative", display: "inline-block" }}>
                {/* PDF viewer */}
                <PdfViewer
                  pdfUrl={getFileUrl(catalog.name)}
                  onSizeReady={(w, h) => setPdfSize({ width: w, height: h })}
                />

                {/* Hotspot Editor ซ้อนทับตรงๆ */}
                {editingCatalog === catalog.name && (
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                    }}
                  >
                    <HotspotEditor
                      width={pdfSize.width}
                      height={pdfSize.height}
                      hotspots={hotspots}
                      onHotspotsChange={setHotspots}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
