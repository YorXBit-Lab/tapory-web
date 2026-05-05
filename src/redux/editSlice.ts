import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { IEditDraft, TemplateId } from '@/configs/types';

const initialState: IEditDraft = {
  orderId: '',
  templateId: 'graduation',
  title: '',
  subtitle: '',
  description: '',
  imageUrl: '',
  spotifyUrl: '',
  date: '',
  isDirty: false,
};

const editSlice = createSlice({
  name: 'edit',
  initialState,
  reducers: {
    setOrderId: (state, action: PayloadAction<string>) => {
      state.orderId = action.payload;
    },
    setTemplate: (state, action: PayloadAction<TemplateId>) => {
      state.templateId = action.payload;
      state.isDirty = true;
    },
    updateField: (state, action: PayloadAction<Partial<Omit<IEditDraft, 'isDirty'>>>) => {
      Object.assign(state, action.payload);
      state.isDirty = true;
    },
    resetDraft: () => initialState,
    markSaved: (state) => {
      state.isDirty = false;
    },
  },
});

export const { setOrderId, setTemplate, updateField, resetDraft, markSaved } = editSlice.actions;
export default editSlice.reducer;
