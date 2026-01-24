import { useSession } from "next-auth/react";

export default function CallAvatar({ profilePictureURL, voiceActivity, active }: { profilePictureURL?: string | undefined; voiceActivity: number; active: boolean }) {

    const threshold = 0.05;

    const { data: session } = useSession();

    return (
        <div className={`relative rounded-full w-32 h-32 flex items-center justify-center border-3 ${voiceActivity > (1 + threshold) ? 'border-green-500' : 'border-transparent'} ${active ? '' : 'opacity-30'}`}>
            {
                profilePictureURL ? (
                    <img src={profilePictureURL} alt="Avatar" className="rounded-full w-full h-full object-cover" />
                ) : (
                    <div className="rounded-full w-full h-full bg-primary text-primary-foreground flex items-center justify-center text-4xl font-bold">
                        {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : 'ME'}
                    </div>
                )
            } 
        </div>
    ); 
}