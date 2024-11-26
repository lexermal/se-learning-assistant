"use client";

import { hasEnvVars } from "@/utils/supabase/check-env-vars";
import { useEffect, useState } from "react";
import { EnvVarWarning } from "./env-var-warning";
import HeaderAuth from "./header-auth";
import { Plugin } from "../app/(protected)/plugin/CommunicationHandler";
import { useRouter } from "next/navigation";

export default function CustomNavbar() {
    const [plugins, setPlugins] = useState<Plugin[]>([]);
    const router = useRouter();

    useEffect(() => {
        fetch(`/api/plugins`).then(res => res.json()).then(setPlugins);
    }, []);

    return <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
        <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
            <div className="flex gap-5 items-center font-semibold">
                <div className="text-xl cursor-pointer" onClick={() => router.push("/")}>World Tree</div>
                <div className="flex items-center gap-2">
                    {plugins.map((plugin, index) => (
                        <DropDownMenu key={index} items={plugin.pluginPages} title={plugin.title} pluginUrl={"/plugin/" + plugin.name} />
                    ))}
                </div>
            </div>
            {!hasEnvVars ? <EnvVarWarning /> : <HeaderAuth />}
        </div>
    </nav>
}

function DropDownMenu(props: { items: { name: string, url: string }[], title: string, pluginUrl: string }) {
    const router = useRouter();

    return <ul className="flex space-x-8">
        <li className="group relative">
            <a href="#" className="hover:text-gray-300 transition p-4"            >
                {props.title}
            </a>
            <div className="absolute left-0 hidden group-hover:block bg-gray-700 rounded shadow-lg mt-2">
                <ul className="py-2">
                    {props.items.map((item, index) => (
                        <li key={index}>
                            <a href={props.pluginUrl + "#" + item.url}
                                className="block px-4 py-2 hover:bg-gray-600"
                                onClick={(e) => {
                                    e.preventDefault();
                                    router.push(props.pluginUrl + "#" + item.url);
                                }}>
                                {item.name}
                            </a>
                        </li>
                    ))}
                </ul>
            </div>
        </li>
    </ul>
}