import { HeartKeychain } from '@/components/icons';
import { Eyebrow } from './SectionHead';

const NFC_BULLETS = [
  {
    n: '01',
    title: 'Chip NTAG213, mã hóa URL riêng',
    body: 'Mỗi móc khóa có một mã duy nhất, không thể nhân bản.',
  },
  {
    n: '02',
    title: 'Hoạt động trên iPhone & Android',
    body: 'iPhone 7 trở lên (iOS 14+), Android có NFC.',
  },
  {
    n: '03',
    title: 'Bạn vẫn chỉnh sửa được sau khi mua',
    body: 'URL cố định, nội dung thay đổi tùy bạn.',
  },
];

export function NfcDemo() {
  return (
    <section className="bg-elevated overflow-hidden py-16 md:py-28">
      <div className="mx-auto max-w-[1240px] px-4 sm:px-6">
        <div className="grid items-center gap-10 md:grid-cols-2 md:gap-20">
          <div>
            <Eyebrow>Công nghệ NFC</Eyebrow>
            <h2 className="text-content1 mb-6 text-[clamp(30px,4vw,46px)] leading-[1.1] font-bold">
              Không app.
              <br />
              Không tải.
              <br />
              <span className="text-primary">Chỉ một cái chạm.</span>
            </h2>
            <p className="text-content2 mb-6 max-w-[460px] text-base">
              NFC là chuẩn không dây tầm gần đã có sẵn trong gần như mọi điện thoại từ 2017. Góc Chạm
              dùng nó để mở thẳng trang web kỷ niệm.
            </p>
            <div className="divide-border border-border divide-y border-y">
              {NFC_BULLETS.map((b) => (
                <div key={b.n} className="flex items-start gap-4 py-4">
                  <span className="text-primary mt-0.5 min-w-[28px] text-sm font-bold">{b.n}</span>
                  <div>
                    <span className="text-content1 mb-0.5 block font-semibold">{b.title}</span>
                    <span className="text-content3 text-sm">{b.body}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* demo stage */}
          <div
            className="border-border relative aspect-square overflow-hidden rounded-2xl border"
            style={{
              background:
                'radial-gradient(circle at center,color-mix(in oklab,var(--color-secondary) 22%,transparent),transparent 60%),var(--color-elevated)',
            }}
          >
            {/* phone */}
            <div
              className="absolute top-1/2 left-[14%] h-[332px] w-[166px] rounded-[26px]"
              style={{
                background: 'linear-gradient(160deg,#261A0E,#1A1208)',
                boxShadow:
                  '0 20px 40px -20px rgba(0,0,0,.4),inset 0 0 0 2px #3D2810,inset 0 0 0 6px #1A1208',
                animation: 'phoneTap 4s ease-in-out infinite',
              }}
            />
            {/* waves */}
            <div className="absolute top-1/2 left-[38%] h-[186px] w-[186px] -translate-y-1/2">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="border-primary absolute inset-0 rounded-full border-2"
                  style={{
                    animation: 'wavePulse 2.2s ease-out infinite',
                    animationDelay: `${i * 0.55}s`,
                    opacity: 0,
                  }}
                />
              ))}
            </div>
            {/* keychain */}
            <div className="absolute top-1/2 right-[16%] z-10 -translate-y-1/2">
              <HeartKeychain size={108} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
