import { ContactDropdown } from './ContactDropdown';

export function FinalCta() {
  return (
    <section className="bg-content1 relative overflow-hidden py-20 text-center md:py-32">
      <div
        className="absolute -top-1/2 right-[-10%] h-[540px] w-[540px] rounded-full opacity-20"
        style={{ background: 'radial-gradient(circle,var(--color-primary),transparent 60%)' }}
      />
      <div
        className="absolute -bottom-1/2 left-[-10%] h-[440px] w-[440px] rounded-full opacity-15"
        style={{ background: 'radial-gradient(circle,var(--color-secondary),transparent 60%)' }}
      />
      <div className="relative z-10 mx-auto max-w-[900px] px-6">
        <h2 className="text-background mb-6 text-[clamp(38px,5.5vw,74px)] leading-[1.05] font-bold">
          Một <span className="text-primary">cái chạm</span>
          <br />
          đáng để giữ cả đời.
        </h2>
        <p className="text-background mx-auto mb-10 max-w-[500px] text-lg">
          Góc Chạm đang mở đặt hàng lứa đầu — giao trong 5 ngày làm việc.
        </p>
        <ContactDropdown />
      </div>
    </section>
  );
}
