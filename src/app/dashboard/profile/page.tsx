"use client";

import { useSession } from "next-auth/react";

export default function ProfilePage() {
    const { data: session } = useSession();

    return (
        <></>
    );
}
