"use client";
import React from "react"; // เพิ่มบรรทัดนี้ด้านบน
import { useState, useRef } from "react";
import { Stage, Layer, Rect, Text } from "react-konva";

// โครงสร้างข้อมูล hotspot แต่ละอัน
interface Hotspot {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  productName: string;
  price: string;
  link: string;
}

interface HotspotEditorProps {
  width: number; // ความกว้างของ PDF
  height: number; // ความสูงของ PDF
  hotspots: Hotspot[];
  onHotspotsChange: (hotspots: Hotspot[]) => void;
}

export default function HotspotEditor({
  width,
  height,
  hotspots,
  onHotspotsChange,
}: HotspotEditorProps) {
  // เก็บตำแหน่งเริ่มต้นตอนลาก
  const [drawing, setDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [currentRect, setCurrentRect] = useState<Hotspot | null>(null);
  // hotspot ที่กำลังแก้ไข
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null);

  // เริ่มวาด hotspot
  const handleMouseDown = (e: any) => {
    const pos = e.target.getStage().getPointerPosition();
    setDrawing(true);
    setStartPos(pos);
    setCurrentRect({
      id: Date.now().toString(),
      x: pos.x,
      y: pos.y,
      width: 0,
      height: 0,
      productName: "",
      price: "",
      link: "",
    });
  };

  // ลากวาด hotspot
  const handleMouseMove = (e: any) => {
    if (!drawing || !currentRect) return;
    const pos = e.target.getStage().getPointerPosition();
    setCurrentRect({
      ...currentRect,
      width: pos.x - startPos.x,
      height: pos.y - startPos.y,
    });
  };

  // จบการวาด hotspot
  const handleMouseUp = () => {
    if (!currentRect) return;
    setDrawing(false);
    // ถ้าวาดเล็กเกินไปให้ไม่บันทึก
    if (Math.abs(currentRect.width) < 10 || Math.abs(currentRect.height) < 10) {
      setCurrentRect(null);
      return;
    }
    setSelectedHotspot(currentRect);
  };

  // บันทึก hotspot พร้อมข้อมูลสินค้า
  const handleSaveHotspot = () => {
    if (!selectedHotspot) return;
    onHotspotsChange([...hotspots, selectedHotspot]);
    setSelectedHotspot(null);
    setCurrentRect(null);
  };

  // ลบ hotspot
  const handleDelete = (id: string) => {
    onHotspotsChange(hotspots.filter((h) => h.id !== id));
  };

  return (
    <div className="flex gap-4 items-start">
      {/* Stage วาง hotspot ทับบน PDF */}
      <Stage
        width={width}
        height={height}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{
          cursor: "crosshair",
          position: "absolute",
          top: 0,
          left: 0,
          zIndex: 10,
        }}
      >
        <Layer>
          {hotspots.map((h) => (
            <React.Fragment key={h.id}>
              <Rect
                x={h.x}
                y={h.y}
                width={h.width}
                height={h.height}
                fill="rgba(59, 130, 246, 0.3)"
                stroke="#3b82f6"
                strokeWidth={2}
                onClick={() => handleDelete(h.id)}
              />
              <Text
                x={h.x + 4}
                y={h.y + 4}
                text={h.productName}
                fontSize={12}
                fill="#1e40af"
              />
            </React.Fragment>
          ))}
          {currentRect && (
            <Rect
              x={currentRect.x}
              y={currentRect.y}
              width={currentRect.width}
              height={currentRect.height}
              fill="rgba(59, 130, 246, 0.2)"
              stroke="#3b82f6"
              strokeWidth={2}
              dash={[4, 4]}
            />
          )}
        </Layer>
      </Stage>

      {/* form อยู่นอก absolute ทำให้กดได้ */}
      {selectedHotspot && (
        <div
          style={{
            position: "fixed", // fixed ลอยอยู่มุมขวา ไม่ถูกบัง
            top: "100px",
            right: "20px",
            zIndex: 100,
          }}
          className="bg-white border rounded-lg p-4 w-64 flex flex-col gap-3 shadow-lg"
        >
          <h3 className="font-bold text-black">ข้อมูลสินค้า</h3>
          <input
            placeholder="ชื่อสินค้า"
            className="border rounded p-2 text-sm text-black"
            value={selectedHotspot.productName}
            onChange={(e) =>
              setSelectedHotspot({
                ...selectedHotspot,
                productName: e.target.value,
              })
            }
          />
          <input
            placeholder="ราคา"
            className="border rounded p-2 text-sm text-black"
            value={selectedHotspot.price}
            onChange={(e) =>
              setSelectedHotspot({ ...selectedHotspot, price: e.target.value })
            }
          />
          <input
            placeholder="ลิงก์สั่งซื้อ (ถ้ามี)"
            className="border rounded p-2 text-sm text-black"
            value={selectedHotspot.link}
            onChange={(e) =>
              setSelectedHotspot({ ...selectedHotspot, link: e.target.value })
            }
          />
          <button
            onClick={handleSaveHotspot}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            บันทึก
          </button>
          <button
            onClick={() => {
              setSelectedHotspot(null);
              setCurrentRect(null);
            }}
            className="bg-gray-200 text-black px-4 py-2 rounded-lg hover:bg-gray-300"
          >
            ยกเลิก
          </button>
        </div>
      )}
    </div>
  );
}
