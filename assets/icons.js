import {
    AntDesign,
    Ionicons,
    Feather,
    MaterialCommunityIcons,
} from '@expo/vector-icons'

export const icons = {
    index: (props) => <AntDesign name="home" size={26} {...props} />,
    explore: (props) => <Feather name="book-open" size={26} {...props} />,
    plants: (props) => (
        <MaterialCommunityIcons name="flower" size={26} {...props} />
    ),
    settings: (props) => <Feather name="settings" size={26} {...props} />,
    takePhoto: (props) => (
        <AntDesign name="camera" size={40} color="white" {...props} />
    ),
    flipCamera: (props) => (
        <Ionicons name="camera-reverse" size={40} color="white" {...props} />
    ),
    back: (props) => (
        <AntDesign name="back" size={40} color="white" {...props} />
    ),
}
