import { useState } from "react";
import { User } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProfileAvatarProps {
    src?: string | null;
    name?: string | null;
    size?: "sm" | "md" | "lg";
    className?: string;
    rounded?: "full" | "xl";
}

const SIZE_MAP = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-14 h-14",
};

const ICON_SIZE_MAP = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-7 h-7",
};

const TEXT_SIZE_MAP = {
    sm: "text-xs",
    md: "text-lg",
    lg: "text-xl",
};

/**
 * Reusable profile avatar with gradient fallback.
 * Shows uploaded image if available, otherwise shows the user's first initial
 * on a cyan-to-purple gradient. Falls back to a User icon if no name is provided.
 */
export function ProfileAvatar({ src, name, size = "md", className, rounded = "full" }: ProfileAvatarProps) {
    const [imageError, setImageError] = useState(false);
    const hasImage = !!src && !imageError;
    const initial = name ? name.charAt(0).toUpperCase() : null;
    const roundedClass = rounded === "full" ? "rounded-full" : "rounded-xl";

    if (hasImage) {
        return (
            <img
                src={src}
                alt={name || "Profile"}
                className={cn(SIZE_MAP[size], roundedClass, "object-cover", className)}
                onError={() => setImageError(true)}
            />
        );
    }

    return (
        <div
            className={cn(
                SIZE_MAP[size],
                roundedClass,
                "bg-gradient-to-br from-cyan-400 to-fuchsia-500 flex items-center justify-center shadow-md flex-shrink-0",
                className
            )}
        >
            {initial ? (
                <span className={cn(TEXT_SIZE_MAP[size], "font-bold text-white select-none")}>
                    {initial}
                </span>
            ) : (
                <User className={cn(ICON_SIZE_MAP[size], "text-white")} />
            )}
        </div>
    );
}
