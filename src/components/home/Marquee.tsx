const MARQUEE_ITEMS = [
  'Quà sinh nhật',
  'Kỷ niệm yêu',
  'Tốt nghiệp',
  'Đám cưới',
  'Du lịch cùng nhau',
  'Quà tặng bố mẹ',
  'Tình bạn 10 năm',
];

export function Marquee() {
  return (
    <div className="border-border bg-elevated overflow-hidden border-y py-4">
      <div
        className="text-content1 flex items-center gap-14 text-xl font-bold whitespace-nowrap"
        style={{ animation: 'scrollX 36s linear infinite' }}
      >
        {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
          <span key={i} className="inline-flex items-center gap-14">
            <span>{item}</span>
            <span className="text-primary text-sm">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
