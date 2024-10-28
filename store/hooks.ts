import { useAppDispatch, useAppSelector } from './store'
import { setImage, unsetImage } from './imageSlice'

export const useImage = () => {
    const dispatch = useAppDispatch()
    const { value } = useAppSelector((state) => state.image)

    const updateImage = (imageUri: string) => {
        dispatch(setImage(imageUri))
    }

    const clearImage = () => {
        dispatch(unsetImage())
    }

    return {
        image: value,
        updateImage,
        clearImage,
    }
}
