"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User } from "@supabase/supabase-js";
import { FaUserCircle } from "react-icons/fa";
import { signOutAction } from "@/app/actions";
import { createClient } from "@/utils/supabase/client";
import { Plugin } from "../app/(protected)/plugin/CommunicationHandler";
import { useEventEmitter } from "@/utils/providers/EventEmitterContext";
import Link from "next/link";

export default function CustomNavbar() {
    const [plugins, setPlugins] = useState<Plugin[]>([]);
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { on } = useEventEmitter();

    function init() {
        const supabase = createClient();
        supabase.auth.getUser().then(({ data }) => {
            setUser(data.user);
            setIsLoading(false);
        });

        // Fetch plugins and check if it failed
        fetch(`/api/plugins`).then(res => res.ok ? res.json() : []).then(setPlugins)
    }

    useEffect(() => {
        init();
        on("user:signed-in", init);
    }, []);

    const userMenu = [
        // { name: "Profile", url: "/profile" },
        { name: "Settings", url: "/settings" },
        {
            name: "Logout", onClick: () => {
                signOutAction();
                setUser(null);
            }
        }
    ] as MenuItem[];

    return <nav className="w-full flex justify-center border-b border-b-gray-500 h-16 z-30 bg-white dark:bg-gray-950">
        <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
            <div className="flex gap-5 items-center font-semibold">
                <div className="text-xl cursor-pointer flex flex-row items-end" onClick={() => router.push("/dashboard")}>
                    <img src="/logo.svg" alt="Rimori" className="h-12 w-36 p-1 px-2 rounded dark:invert" />
                    <p className="dark:text-gray-300 text-sm" style={{ marginBottom: "7px" }}>(beta)</p>
                </div>
                <div className="flex items-center gap-2">
                    {user && plugins && plugins.map((plugin, index) => {
                        const items = plugin.pluginPages.map(p => ({ ...p, url: `/plugin/${plugin.name}#${p.url}` }));
                        return <DropDownMenu key={index} items={items} title={plugin.title} />;
                    })}
                </div>
                {!isLoading && !user && <div className="hover:text-gray-300 transition p-4">
                    <Link href={"/waitlist"}>Waitlist</Link>
                </div>}
            </div>
            {isLoading ? "" : (user ? <DropDownMenu title={<FaUserCircle size={24} />} items={userMenu} rightAligned />
                : <AuthComponent />)}
        </div>
    </nav>
}

function AuthComponent() {
    return <a href="/sign-in" className="dark:text-gray-300 font-bold hover:bg-yellow-500 dark:hover:text-gray-100 bg-yellow-400 dark:bg-gray-800 border border-gray-700 p-2 rounded ml-2">
        Get started
    </a>
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
    return <ul className="flex space-x-8 cursor-default">
        <li className="group relative">
            <div className="dark:hover:text-gray-300 hover:text-gray-700 transition p-4">
                {props.title}
            </div>
            <div className={"absolute hidden group-hover:block bg-gray-300 dark:bg-gray-700 rounded shadow-lg z-50 overflow-hidden " + (props.rightAligned ? " right-0" : "left-0")}>
                <ul className="">
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
    return <a href={props.url || "#"} className={"block px-4 py-2 hover:bg-gray-400 dark:hover:bg-gray-600" + (props.url || props.onClick ? " cursor-pointer" : "")} onClick={(e) => {
        e.preventDefault();

        if (props.onClick) {
            props.onClick();
        } else if (props.url) {
            router.push(props.url);
        }
    }}>{props.name}</a>
}