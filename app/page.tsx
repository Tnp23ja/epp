import Image from "next/image";

export default function Home() {
  return (
      <main className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-6">EPP Dashboard</h1>
      <div className="grid grid-cols-1 gap-4">
        <a href="/dashboard" className="p-6 border rounded-lg hover:bg-gray-50">
          <h2 className="text-xl font-semibold">หลังบ้าน →</h2>
          <p className="text-gray-500">จัดการกระดาษแปะของคุณ</p>
        </a>
        <a href="/catalog" className="p-6 border rounded-lg hover:bg-gray-50">
          <h2 className="text-xl font-semibold">ดู Catalog →</h2>
          <p className="text-gray-500">หน้าที่ผู้ใช้ทั่วไปเห็น</p>
        </a>
      </div>
    </main>
  );
}
