"use client";

import { useEffect, useState } from "react";
import { Plugin } from "../app/(protected)/plugin/CommunicationHandler";
import { useRouter } from "next/navigation";
import { FaUserCircle } from "react-icons/fa";
import { signOutAction } from "@/app/actions";
import { User } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";

export default function CustomNavbar() {
    const [plugins, setPlugins] = useState<Plugin[]>([]);
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const supabase = createClient();

        supabase.auth.getUser().then(({ data }) => {
            setUser(data.user);
            setIsLoading(false);
        });

        fetch(`/api/plugins`).then(res => res.json()).then(setPlugins);
    }, []);


    const userMenu = [
        // { name: "Profile", url: "/profile" },
        { name: "Settings", url: "/settings" },
        { name: "Logout", onClick: () => signOutAction() }
    ] as MenuItem[];

    return <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
        <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
            <div className="flex gap-5 items-center font-semibold">
                <div className="text-xl cursor-pointer" onClick={() => router.push("/")}>World Tree</div>
                <div className="flex items-center gap-2">
                    {user && plugins.map((plugin, index) => {
                        const items = plugin.pluginPages.map(p => ({ ...p, url: `/plugin/${plugin.name}#${p.url}` }));
                        return <DropDownMenu key={index} items={items} title={plugin.title} />;
                    })}
                </div>
            </div>
            {isLoading ? "" : (user ? <DropDownMenu title={<FaUserCircle size={24} />} items={userMenu} rightAligned />
                : <AuthComponents />)}
        </div>
    </nav>
}

function AuthComponents() {
    return <div>
        <a href="/sign-in" className="text-gray-300 hover:text-gray-100 bg-gray-800 border border-gray-500 p-2 rounded text-xl">Register</a>
        <a href="/sign-in" className="text-gray-300 hover:text-gray-100 bg-gray-800 border border-gray-500 p-2 rounded text-xl ml-2">Login</a>
    </div>
}

interface MenuItem {
    name: string,
    url?: string
    onClick?: () => void
    children?: React.ReactNode
}

interface DropMenuProps {
    title: string | React.ReactNode,
    items: MenuItem[],
    rightAligned?: boolean
}

function DropDownMenu(props: DropMenuProps) {
    return <ul className="flex space-x-8">
        <li className="group relative">
            <div className="hover:text-gray-300 transition p-4">
                {props.title}
            </div>
            <div className={"absolute hidden group-hover:block bg-gray-700 rounded shadow-lg z-50 overflow-hidden " + (props.rightAligned ? " right-0" : "left-0")}>
                <ul className="py-2kk">
                    {props.items.map((item, index) => {
                        return (
                            <li key={index}>
                                <DropDownMenuItem name={item.name} url={item.url} onClick={item.onClick} />
                            </li>
                        );
                    })}
                </ul>
            </div>
        </li>
    </ul>
}

function DropDownMenuItem(props: { name: string, url?: string, children?: React.ReactNode, onClick?: () => void }) {
    const router = useRouter();

    if (props.children) {
        return props.children;
    }
    return <a href={props.url || "#"} className={"block px-4 py-2 hover:bg-gray-600" + (props.url || props.onClick ? " cursor-pointer" : "")} onClick={(e) => {
        e.preventDefault();

        if (props.onClick) {
            props.onClick();
        } else if (props.url) {
            router.push(props.url);
        }
    }}>{props.name}</a>
}