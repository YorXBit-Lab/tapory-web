import type { ITemplateStyle } from '@/configs/types';
import type { FieldMeta } from '@/templates/types';

export const STARDUST_STYLES: ITemplateStyle[] = [
  { id: 'stardust-film', layout: 'film', name: 'Memory Film',
    colors: { primary: '#f4ecff', secondary: '#c86adf', accent: '#0b0618' } },
];

export const STARDUST_FIELDS: FieldMeta[] = [
  { key: 'photoUrls',    label: 'Ảnh kỷ niệm (nên 6–10 ảnh)', placeholder: '',                              type: 'images'   },
  { key: 'title',        label: 'Tên người nhận',              placeholder: 'VD: Bảo An',                   type: 'text'     },
  { key: 'mainGreeting', label: 'Lời chào mở đầu',             placeholder: 'VD: Chúc Mừng',                type: 'text'     },
  { key: 'bigWish',      label: 'Câu chúc lớn',                placeholder: 'VD: Happy Birthday',           type: 'text'     },
  { key: 'description',  label: 'Lá thư (mỗi dòng một câu)',   placeholder: 'Hôm nay là một ngày…',         type: 'textarea' },
  { key: 'finalMessage', label: 'Lời nhắn cuối phim',          placeholder: 'Cảm ơn vì đã xuất hiện…',      type: 'textarea' },
];
