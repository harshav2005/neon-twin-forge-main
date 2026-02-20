// src/components/ui/NavGate.tsx

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { isUserLoggedIn } from '@/lib/auth-check'; // Utility to check login status
import { cn } from '@/lib/utils';

// Define which path unauthorized users should be sent to
const UNAUTHORIZED_PATH = "/signup"; 

interface NavGateProps {
    to: string;
    children: React.ReactNode;
    className?: string;
    // Add any other props passed to the original Link (e.g., onClick)
    [key: string]: any; 
}

export function NavGate({ to, children, className, ...rest }: NavGateProps) {
    const navigate = useNavigate();
    const isLoggedIn = isUserLoggedIn();

    // Routes that should always be accessible, even if logged out
    const publicPaths = ["/", "/signup", "/login", "/forgot-password"];

    const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
        // If the destination is already a public page, let the default behavior run.
        if (publicPaths.includes(to)) {
            return;
        }

        if (!isLoggedIn) {
            event.preventDefault();
            // Interrupt navigation and send to signup/login page
            navigate(UNAUTHORIZED_PATH);
        }
        // If logged in, the default Link behavior proceeds to 'to'
    };

    return (
        <Link 
            to={to} 
            onClick={handleClick} 
            className={className}
            {...rest}
        >
            {children}
        </Link>
    );
}