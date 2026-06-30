import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LANDING_AVATAR_IMAGE } from '@/data/landing';

interface LandingAvatarProps {
    alt: string;
    size?: 'default' | 'sm' | 'lg';
    initials?: string;
    src?: string;
}

export function LandingAvatar({
    alt,
    size = 'default',
    initials,
    src = LANDING_AVATAR_IMAGE,
}: LandingAvatarProps) {
    return (
        <Avatar size={size}>
            <AvatarImage src={src} alt={alt} />
            {initials ? (
                <AvatarFallback className="bg-primary/10 text-primary">{initials}</AvatarFallback>
            ) : null}
        </Avatar>
    );
}
