import { AntDesign, Feather, MaterialCommunityIcons } from '@expo/vector-icons'

export const icons = {
    index: (props) => <AntDesign name="home" size={26} {...props} />,
    explore: (props) => <Feather name="book-open" size={26} {...props} />,
    plants: (props) => (
        <MaterialCommunityIcons name="flower" size={26} {...props} />
    ),
    settings: (props) => <Feather name="settings" size={26} {...props} />,
}
