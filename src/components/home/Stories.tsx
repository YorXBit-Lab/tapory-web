import { Divider } from 'antd';
import { SectionHead } from './SectionHead';

type StoryType = 'featured' | 'plain' | 'blush' | 'dark';

const STORIES: {
  type: StoryType;
  label: string;
  title: string;
  body: string;
  quote?: string;
  author?: string;
}[] = [
  {
    type: 'featured',
    label: 'Cặp đôi',
    title: 'Cho người ở rất xa.',
    body: 'Mua một cặp Góc Chạm — một móc cho mình, một móc cho người ấy, cả hai cùng chỉ về một trang. Mỗi lần chạm là một lần nhớ.',
    quote: '"Em ở Hà Nội, anh ở Sài Gòn. Đêm nào cũng chạm vào nó như chào nhau ngủ ngon."',
    author: '',
  },
  {
    type: 'plain',
    label: 'Bạn thân',
    title: '10 năm tình bạn.',
    body: 'Tag tên ba người, ngày gặp đầu tiên, ảnh chụp năm cấp 3. Một món quà nhỏ nhưng lưu trữ cả thanh xuân.',
  },
  {
    type: 'blush',
    label: 'Sinh nhật',
    title: 'Một tuổi mới rực rỡ.',
    body: 'Thay vì thiệp giấy — một chiếc móc khóa với album mini và lời chúc viết tay. Quà sẽ giữ được nhiều năm.',
  },
  {
    type: 'dark',
    label: 'Gia đình',
    title: 'Tặng bố mẹ ngày kỷ niệm cưới.',
    body: 'Ảnh cưới ngày xưa, ảnh con cháu hôm nay. Chạm là cả gia đình hiện ra.',
  },
  {
    type: 'plain',
    label: 'Tốt nghiệp',
    title: 'Khép lại một chặng đường.',
    body: 'Tên trường, năm ra trường, ảnh cả lớp. Kỷ vật kết hợp hiện vật và kỷ niệm số.',
  },
];

const WRAP_CLS: Record<StoryType, string> = {
  featured: 'text-white',
  plain: 'bg-elevated border border-border text-content1',
  blush: 'bg-primary/10 border border-primary/20 text-content1',
  dark: 'bg-content1 text-background',
};

export function Stories() {
  return (
    <section id="stories" className="bg-background py-14 md:py-24">
      <div className="mx-auto max-w-[1240px] px-4 sm:px-6">
        <SectionHead
          eyebrow="Cảm hứng"
          title={
            <>
              Góc Chạm được tặng vào những <span className="text-primary">khoảnh khắc</span> nào?
            </>
          }
        />
        <div className="grid gap-5 md:grid-cols-[1.2fr_1fr_1fr]">
          {STORIES.map((s, i) => {
            const isFeat = s.type === 'featured';
            return (
              <div
                key={i}
                className={`flex flex-col rounded-2xl p-6 sm:p-8 ${WRAP_CLS[s.type]} ${isFeat ? 'min-h-[320px] sm:min-h-[520px] md:row-span-2' : 'min-h-[240px] sm:min-h-[280px]'}`}
                style={isFeat ? { background: 'linear-gradient(165deg,#8B6B52,#5E4634)' } : {}}
              >
                <span
                  className={`mb-4 block text-[11px] font-bold tracking-[0.18em] uppercase ${isFeat ? 'text-white/75' : 'text-content3'}`}
                >
                  {s.label}
                </span>
                <h3
                  className={`mb-3 leading-[1.15] font-bold ${isFeat ? 'text-[36px] text-white' : 'text-[24px]'}`}
                >
                  {s.title}
                </h3>
                <p
                  className={`mb-0 leading-relaxed ${isFeat ? 'text-base text-white/90' : 'text-content2 text-sm'}`}
                >
                  {s.body}
                </p>
                {s.quote && (
                  <>
                    <Divider className="!mt-auto !mb-5 !border-white/20" />
                    <div className="text-[16px] leading-[1.45] font-semibold text-white/95 italic">
                      {s.quote}
                    </div>
                    {s.author && (
                      <div className="mt-4 flex items-center gap-2.5">
                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-white/40 bg-white/25 text-xs font-bold text-white">
                          {s.author.charAt(0)}
                        </div>
                        <span className="text-sm text-white/70">{s.author}</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
