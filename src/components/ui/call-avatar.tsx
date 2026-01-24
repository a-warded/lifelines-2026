export default function CallAvatar({ profilePictureURL, voiceActivity, active }: { profilePictureURL: string; voiceActivity: number; active: boolean }) {

    const threshold = 0.05;

    return (
        <div className={`relative rounded-full w-32 h-32 flex items-center justify-center border-3 ${voiceActivity > (1 + threshold) ? 'border-green-500' : 'border-transparent'} ${active ? '' : 'opacity-30'}`}>
            <img src={profilePictureURL} alt="Profile" className="rounded-full w-full h-full object-cover" />   
        </div>
    ); 
}