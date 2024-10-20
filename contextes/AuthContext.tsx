import React, {
    createContext,
    useContext,
    useEffect,
    useRef,
    useState,
} from 'react'
import { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/utils/supabase'

interface AuthContextProps {
    user: User | null
    session: Session | null
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined)

export const AuthProvider: React.FC<{
    children: React.ReactNode
    onSessionInitialized: () => void
}> = ({ children, onSessionInitialized }) => {
    const [session, setSession] = useState<Session | null>(null)
    const [user, setUser] = useState<User | null>(null)
    const onSessionInitializedRef = useRef(onSessionInitialized)

    useEffect(() => {
        onSessionInitializedRef.current = onSessionInitialized
    }, [onSessionInitialized])

    useEffect(() => {
        const { data: authListener } = supabase.auth.onAuthStateChange(
            (event, session) => {
                setSession(session)
                setUser(session?.user ?? null)
            },
        )

        const initSession = async () => {
            const { data } = await supabase.auth.getSession()
            setSession(data.session)
            setUser(data.session?.user ?? null)

            onSessionInitializedRef.current()
        }

        initSession()

        return () => {
            authListener?.subscription.unsubscribe()
        }
    }, [])

    return (
        <AuthContext.Provider value={{ user, session }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
