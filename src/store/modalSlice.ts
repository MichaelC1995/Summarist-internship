import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ModalState {
    isOpen: boolean;
    modalType: 'login' | 'register' | 'forgotPassword' | null;
}

const initialState: ModalState = {
    isOpen: false,
    modalType: null,
};

const modalSlice = createSlice({
    name: 'modal',
    initialState,
    reducers: {
        openModal: (state, action: PayloadAction<'login' | 'register' | 'forgotPassword'>) => {
            state.isOpen = true;
            state.modalType = action.payload;
        },
        closeModal: (state) => {
            state.isOpen = false;
            state.modalType = null;
        },
        switchModal: (state, action: PayloadAction<'login' | 'register' | 'forgotPassword'>) => {
            state.modalType = action.payload;
        },
    },
});

export const { openModal, closeModal, switchModal } = modalSlice.actions;
export default modalSlice.reducer;