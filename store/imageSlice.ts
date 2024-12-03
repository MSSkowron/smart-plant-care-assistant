import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface ImageState {
    plantHealthCheckImage: string | undefined
    newPlantImage: string | undefined
}

const initialState: ImageState = {
    plantHealthCheckImage: undefined,
    newPlantImage: undefined,
}

export const imageSlice = createSlice({
    name: 'image',
    initialState,
    reducers: {
        setPlantHealthCheckImage: (state, action: PayloadAction<string>) => {
            state.plantHealthCheckImage = action.payload
        },
        unsetPlantHealthCheckImage: (state) => {
            state.plantHealthCheckImage = undefined
        },
        setNewPlantImage: (state, action: PayloadAction<string>) => {
            state.newPlantImage = action.payload
        },
        unsetNewPlantImage: (state) => {
            state.newPlantImage = undefined
        },
    },
})

export const {
    setPlantHealthCheckImage,
    unsetPlantHealthCheckImage,
    setNewPlantImage,
    unsetNewPlantImage,
} = imageSlice.actions

export default imageSlice.reducer
