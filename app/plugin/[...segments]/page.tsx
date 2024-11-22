"use client";

import { Plugin } from "../CommunicationHandler";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import CommunicationHandler from "../CommunicationHandler";
import { useRouter } from "next/navigation";

export default function PluginPage({ params }: { params: Promise<{ segments: string[] }> }) {
  const iframeRef = useRef(null as HTMLDivElement | null);
  const [plugin, setPlugin] = useState(null as Plugin | null);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    fetch(`/api/plugins`)
      .then(res => res.json())
      .then(async data => {
        const { segments: [pluginName, ...subpath] } = await params;
        console.log("segments", { pluginName, subpath });
        const plugins = data.filter((plugin: any) => plugin.name === pluginName);
        if (plugins.length > 0) {
          setPlugin(plugins[0]);
        }
      });
  }, []);

  useEffect(() => {
    if (!iframeRef.current || !plugin) {
      return;
    }

    const connection = new CommunicationHandler(supabase, plugin, iframeRef.current,window.location.hash);

    connection.init();

    connection.subscribe("getCards", () => {
      connection.emit("setCards", ["card1", "card2"]);
    });
    connection.subscribe("heightAdjustment", (height: number) => {
      if (!iframeRef.current) {
        return;
      }
      const iframe = (iframeRef.current.children[0] as HTMLIFrameElement);

      // console.log("adjusting height", height);
      iframe.style.minHeight = `calc(100vh - 300px)`;
      iframe.style.height = `${height}px`;
      iframe.setAttribute("scrolling", "no");
    });

    connection.subscribe("urlChange", async (url: string) => {
      console.log("urlChange", url);
      router.push(url);
    });
  }, [plugin]);

  if (!plugin) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Plugin: {plugin.name}</h1>
      <p>{plugin.description}</p>
      <div
        ref={iframeRef}
        className="w-full"
        style={{ border: "1px solid #ccc" }}
      ></div>
    </div>
  );
}
