import { SectionHead } from './SectionHead';
import { TemplatesGallery } from './TemplatesGallery';

export function TemplatesSection() {
  return (
    <section id="templates" className="bg-elevated py-14 md:py-24">
      <div className="mx-auto max-w-[1240px] px-4 sm:px-6">
        <SectionHead
          eyebrow="8 mẫu thiết kế"
          title={
            <>
              Mỗi mẫu là một <span className="text-primary">tâm trạng</span>.
            </>
          }
          sub="Từ ngọt ngào đến tối giản, từ điện ảnh đến nhật ký — chọn mẫu hợp với câu chuyện của bạn."
        />
        <TemplatesGallery />
      </div>
    </section>
  );
}
