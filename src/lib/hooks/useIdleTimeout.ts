import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '@/lib/store';
import { logout } from '@/lib/store/slice/auth/authSlice';

const useIdleTimeout = (timeout = 30 * 60 * 1000) => { // 30 minutes default
    const router = useRouter();
    const dispatch = useAppDispatch();

    const resetTimer = useCallback(() => {
        // Reset any existing timer
        if (window.idleTimer) {
            clearTimeout(window.idleTimer);
        }

        // Set new timer
        window.idleTimer = setTimeout(() => {
            // Clear storage and redirect to login
            dispatch(logout());
            localStorage.removeItem('token');
            localStorage.removeItem('accessToken');
            localStorage.removeItem('userProfile');
            router.push('/login');
        }, timeout);
    }, [timeout, dispatch, router]);

    useEffect(() => {
        // Set up event listeners
        const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];

        const handleActivity = () => {
            resetTimer();
        };

        // Initial setup
        resetTimer();

        // Add event listeners
        events.forEach(event => {
            window.addEventListener(event, handleActivity);
        });

        // Clean up
        return () => {
            if (window.idleTimer) {
                clearTimeout(window.idleTimer);
            }
            events.forEach(event => {
                window.removeEventListener(event, handleActivity);
            });
        };
    }, [resetTimer]);
};

// Extend the Window interface to include our timer
declare global {
    interface Window {
        idleTimer: NodeJS.Timeout | null;
    }
}

export default useIdleTimeout;