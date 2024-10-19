import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient, User } from '@supabase/supabase-js'

export const supabase = createClient(
    process.env.EXPO_PUBLIC_SUPABASE_URL || '',
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
    {
        auth: {
            storage: AsyncStorage,
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: false,
        },
    },
)

// Sign up
export const signUp = async (
    email: string,
    password: string,
): Promise<User | null> => {
    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        })
        if (error) handleError(error)
        return data.user
    } catch (error) {
        handleError(error)
        return null
    }
}

// Sign in
export const signIn = async (
    email: string,
    password: string,
): Promise<User | null> => {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })
        if (error) handleError(error)
        return data.user
    } catch (error) {
        handleError(error)
        return null
    }
}

// Sign out
export const signOut = async (): Promise<void> => {
    try {
        const { error } = await supabase.auth.signOut()
        if (error) handleError(error)
        return
    } catch (error) {
        handleError(error)
        return
    }
}

// Reset password
export const resetPassword = async (email: string): Promise<void> => {
    try {
        const { error } = await supabase.auth.resetPasswordForEmail(email)
        if (error) handleError(error)
        return
    } catch (error) {
        handleError(error)
        return
    }
}

// Get user
export const getUser = async (): Promise<User | null> => {
    const {
        data: { user },
    } = await supabase.auth.getUser()
    return user
}

const handleError = (error: any): never => {
    if (error instanceof Error) {
        throw new Error(error.message)
    }
    throw new Error(String(error))
}
