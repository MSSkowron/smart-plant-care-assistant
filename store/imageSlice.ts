import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface ImageState {
    value: string | undefined
}

const initialState: ImageState = {
    value: undefined,
}

export const imageSlice = createSlice({
    name: 'image',
    initialState,
    reducers: {
        setImage: (state, action: PayloadAction<string>) => {
            state.value = action.payload
        },
        unsetImage: (state) => {
            state.value = undefined
        },
    },
})

export const { setImage, unsetImage } = imageSlice.actions
export default imageSlice.reducer
