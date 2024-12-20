"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User } from "@supabase/supabase-js";
import { FaUserCircle } from "react-icons/fa";
import { signOutAction } from "@/app/actions";
import { SupabaseClient } from "@/utils/supabase/client";
import { Plugin } from "../app/(protected)/plugin/CommunicationHandler";
import { useEventEmitter } from "@/utils/providers/EventEmitterContext";
import Link from "next/link";

export default function CustomNavbar() {
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null);
    const [plugins, setPlugins] = useState<Plugin[]>([]);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { on } = useEventEmitter();
    const router = useRouter();

    function init() {
        const supabase = SupabaseClient.getClient();
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

    return (
        <nav className="flex items-center justify-between flex-wrap border-b border-b-gray-500 z-30 bg-white dark:bg-gray-950 w-full">
            <div className="flex flex-shrink-0 text-white mr-6 items-end cursor-pointer" onClick={() => router.push("/dashboard")}>
                <img src="/logo.svg" alt="Rimori" className="h-12 w-36 p-1 px-2 rounded dark:invert" />
                <p className="dark:text-gray-300 text-sm" style={{ marginBottom: "7px" }}>(beta)</p>
            </div>
            <div className="block md:hidden">
                <button
                    className="flex items-center px-3 py-2 mr-2 border rounded text-gray-200 border-gray-400 hover:text-white hover:border-white"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}                >
                    <svg className="fill-current h-3 w-3" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <title>Menu</title>
                        <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z" />
                    </svg>
                </button>
            </div>
            <div className={`w-full block flex-grow px-2 pb-3 md:pb-0 md:flex md:items-center md:w-auto ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
                <div className="text-sm md:flex-grow">
                    {user && plugins && plugins.map((plugin, index) => {
                        const items = plugin.pluginPages.map(p => ({ ...p, url: `/plugin/${plugin.name}#${p.url}` }));
                        return <DropDownMenu key={index} items={items} title={plugin.title} onClick={() => setIsMobileMenuOpen(false)} />;
                    })}
                    {!isLoading && !user && <div className="hover:text-gray-300 transition p-4">
                        <Link href={"/waitlist"}>Waitlist</Link>
                    </div>}
                </div>
                <div className="flex items-center gap-2">
                    {isLoading ? "" : (user ? <DropDownMenu title={<FaUserCircle size={24} />} items={userMenu} rightAligned={!isMobileMenuOpen} onClick={() => setIsMobileMenuOpen(false)} />
                        : <AuthComponent />)}
                </div>
            </div>
        </nav>
    );
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
    onClick: () => void
}

function DropDownMenu(props: DropMenuProps) {
    return <ul className="block mt-4 md:inline-block md:mt-0 mr-4 space-x-8 cursor-default">
        <li className="group relative">
            <div className="dark:hover:text-gray-300 hover:text-gray-700 transition">
                {props.title}
            </div>
            <div className={"absolute hidden w-max group-hover:block bg-gray-300 dark:bg-gray-700 rounded shadow-lg z-50 overflow-hidden " + (props.rightAligned ? " right-0" : "left-0")}>
                <ul className="">
                    {props.items.map((item, index) => {
                        return (
                            <li key={index}>
                                <DropDownMenuItem name={item.name} url={item.url} onClick={() => {
                                    props.onClick();
                                    item.onClick && item.onClick();
                                }} />
                            </li>
                        );
                    })}
                </ul>
            </div>
        </li>
    </ul>
}

function DropDownMenuItem(props: { name: string, url?: string, children?: React.ReactNode, onClick: () => void }) {
    const router = useRouter();

    if (props.children) {
        return props.children;
    }
    return <a href={props.url || "#"} className={"inline-block md:mt-0 text-sm px-4 py-2 leading-none w-full hover:bg-gray-400 dark:hover:bg-gray-600 cursor-pointer"} onClick={(e) => {
        e.preventDefault();

        if (props.onClick) {
            props.onClick();
            if (props.url) {
                router.push(props.url);
            }
        }
    }}>{props.name}</a>
}