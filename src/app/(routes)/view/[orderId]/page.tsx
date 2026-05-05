import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: { orderId: string };
}): Promise<Metadata> {
  return {
    title: `Trang kỷ niệm – ${params.orderId}`,
  };
}

export default function ViewPage({ params }: { params: { orderId: string } }) {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <p className="text-6xl mb-4">🎁</p>
        <h1 className="text-2xl font-bold text-tapory-navy mb-2">Trang kỷ niệm</h1>
        <p className="text-gray-500 text-sm">Mã: {params.orderId}</p>
        {/* Memorial content will be loaded and rendered here */}
        <div className="mt-8 p-6 rounded-xl border border-dashed border-gray-200 text-gray-400 text-sm">
          Nội dung kỷ niệm sẽ hiển thị ở đây
        </div>
      </div>
    </main>
  );
}
