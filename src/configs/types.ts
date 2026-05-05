export type TemplateId = 'graduation' | 'wedding' | 'birthday' | 'anniversary' | 'spotify';

export interface ITemplate {
  id: TemplateId;
  name: string;
  icon: string;
  occasion: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
  };
}

export interface IMemorial {
  orderId: string;
  templateId: TemplateId;
  title: string;
  subtitle?: string;
  description?: string;
  imageUrl?: string;
  spotifyUrl?: string;
  date?: string;
}

export interface IMemorialDoc extends IMemorial {
  createdAt?: string;
  updatedAt?: string;
}

export interface IEditDraft extends IMemorial {
  isDirty: boolean;
}
