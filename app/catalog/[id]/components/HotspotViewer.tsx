"use client"

import React, { useState } from "react"
import { Stage, Layer, Rect } from "react-konva"

interface Hotspot {
  id: string
  x: number
  y: number
  width: number
  height: number
  product_name: string
  price: string
  link: string
}

interface HotspotViewerProps {
  width: number
  height: number
  hotspots: Hotspot[]
}

export default function HotspotViewer({ width, height, hotspots }: HotspotViewerProps) {
  // เก็บ hotspot ที่กดเลือก
  const [selected, setSelected] = useState<Hotspot | null>(null)

  return (
    <>
      {/* Stage วาง hotspot ทับบน PDF */}
      <Stage
        width={width}
        height={height}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          zIndex: 10,
          cursor: "pointer",
          pointerEvents: "auto" // รับ event เฉพาะตรง hotspot
        }}
      >
        <Layer>
          {hotspots.map((h) => (
            <Rect
              key={h.id}
              x={h.x}
              y={h.y}
              width={h.width}
              height={h.height}
              fill="rgba(0, 0, 0, 0)" // โปร่งใส 100%
              stroke="rgba(0, 0, 0, 0)" // ไม่มีขอบ
              strokeWidth={2}
              onClick={() => setSelected(h)} // กดแล้วเปิด popup
            />
          ))}
        </Layer>
      </Stage>

      {/* Popup แสดงข้อมูลสินค้า */}
      {selected && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.5)",
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
          onClick={() => setSelected(null)} // กดพื้นหลังเพื่อปิด
        >
          <div
            className="bg-white rounded-lg p-6 w-80 flex flex-col gap-3"
            onClick={(e) => e.stopPropagation()} // ไม่ให้ปิดเมื่อกดใน popup
          >
            <h2 className="text-xl font-bold text-black">{selected.product_name}</h2>
            <p className="text-2xl text-blue-500 font-bold">฿{selected.price}</p>
            {selected.link && (
              <a
                href={selected.link}
                target="_blank"
                className="bg-blue-500 text-white px-4 py-2 rounded-lg text-center hover:bg-blue-600"
              >
                สั่งซื้อ / ดูเพิ่มเติม
              </a>
            )}
            <button
              onClick={() => setSelected(null)}
              className="bg-gray-200 text-black px-4 py-2 rounded-lg hover:bg-gray-300"
            >
              ปิด
            </button>
          </div>
        </div>
      )}
    </>
  )
}