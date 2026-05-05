import { Header } from '@/components/layout/Header';

export const metadata = {
  title: 'Chỉnh sửa kỷ niệm – Tapory',
};

export default function EditPage({ params }: { params: { orderId: string } }) {
  return (
    <>
      <Header />
      <main className="flex-1 max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Form panel */}
          <section className="flex-1">
            <h1 className="text-2xl font-bold text-tapory-navy mb-6">
              Tùy chỉnh kỷ niệm
            </h1>
            <p className="text-gray-400 text-sm">Mã đơn: {params.orderId}</p>
            {/* Form fields will be implemented here */}
            <div className="mt-8 p-6 rounded-xl border border-dashed border-gray-200 text-center text-gray-400">
              Form chỉnh sửa – sẽ triển khai tiếp theo
            </div>
          </section>

          {/* Live preview panel */}
          <aside className="lg:w-80 flex justify-center">
            <div className="w-72 h-[560px] rounded-[2.5rem] border-4 border-gray-800 bg-gray-50 overflow-hidden shadow-2xl flex items-center justify-center text-gray-400 text-sm">
              Live preview
            </div>
          </aside>
        </div>
      </main>
    </>
  );
}
