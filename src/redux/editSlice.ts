import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { IEditDraft, TemplateId } from '@/configs/types';

const initialState: IEditDraft = {
  orderId: '',
  templateId: 'graduation',
  styleId: 'grad-classic',
  frameId: 'none',
  effectId: 'none',
  bgColor: '',
  bgImageUrl: '',
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
    setStyle: (state, action: PayloadAction<string>) => {
      state.styleId = action.payload;
      state.isDirty = true;
    },
    setFrame: (state, action: PayloadAction<string>) => {
      state.frameId = action.payload;
      state.isDirty = true;
    },
    setEffect: (state, action: PayloadAction<string>) => {
      state.effectId = action.payload;
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

export const { setOrderId, setTemplate, setStyle, setFrame, setEffect, updateField, resetDraft, markSaved } = editSlice.actions;
export default editSlice.reducer;
