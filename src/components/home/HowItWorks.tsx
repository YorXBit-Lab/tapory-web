import { HomeIcon, PencilIcon, MapPinIcon } from '@/components/icons';
import { SectionHead } from './SectionHead';

const HOW_STEPS = [
  {
    Icon: HomeIcon,
    title: 'Đặt móc khóa',
    desc: 'Chọn dáng tim, tag hoặc đĩa tròn. Mỗi móc có chip NFC riêng và URL được lập trình sẵn.',
  },
  {
    Icon: PencilIcon,
    title: 'Tự tay thiết kế',
    desc: 'Chọn 1 trong 8 mẫu, điền tên, ngày, lời nhắn, upload ảnh — tất cả ngay trong trình duyệt.',
  },
  {
    Icon: MapPinIcon,
    title: 'Chạm là xem',
    desc: 'Đưa điện thoại sát móc khóa — trang kỷ niệm hiện ra ngay, không cần app, không cần đăng nhập.',
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="bg-background py-14 md:py-24">
      <div className="mx-auto max-w-[1240px] px-4 sm:px-6">
        <SectionHead
          eyebrow="Cách hoạt động"
          title={
            <>
              Ba bước, <span className="text-primary">một phút</span>, một kỷ niệm.
            </>
          }
        />
        <div className="relative grid md:grid-cols-3">
          {/* dashed connector */}
          <div
            className="pointer-events-none absolute top-[58px] right-[16%] left-[16%] hidden h-px md:block"
            style={{
              background:
                'repeating-linear-gradient(to right,var(--color-primary) 0 4px,transparent 4px 10px)',
              opacity: 0.35,
            }}
          />
          {HOW_STEPS.map((s, i) => (
            <div key={i} className="px-4 text-center md:px-8">
              <div className="border-primary text-primary bg-background relative z-10 mx-auto mb-8 flex h-[116px] w-[116px] items-center justify-center rounded-full border">
                <s.Icon size={30} />
              </div>
              <h3 className="text-content1 mb-2 text-xl font-semibold">{s.title}</h3>
              <p className="text-content3 mx-auto mb-0 max-w-[260px] text-sm">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
