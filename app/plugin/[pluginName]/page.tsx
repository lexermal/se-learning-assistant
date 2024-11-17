"use client";

import { Plugin } from "./CommunicationHandler";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import CommunicationHandler from "./CommunicationHandler";

export default function PluginPage({ params }: any) {
  const iframeRef = useRef(null as HTMLDivElement | null);
  const [plugin, setPlugin] = useState(null as Plugin | null);
  const supabase = createClient();

  useEffect(() => {
    // params.then(async ({ pluginName }: any) => {
    //   const allowedPlugin = await fetch(`/api/plugins`)
    //     .then(res => res.json())
    //     .then((data) => data.filter((plugin: any) => plugin.name === pluginName));

    //   // Allowed plugins for security
    //   if (allowedPlugin.length > 0) {
    //     setPlugin(allowedPlugin[0]);
    //   }
    // });
    setPlugin({ name: "flashcards", description: "A sample", url: "http://localhost:3001" });
  }, []);

  useEffect(() => {
    if (!iframeRef.current || !plugin) {
      return;
    }

    const connection = new CommunicationHandler(supabase, plugin, iframeRef.current);
    connection.init();
    connection.subscribe("getCards", () => {
      connection.emit("setCards", ["card1", "card2"]);
    });
    connection.subscribe("heightAdjustment", (height: number) => {
      if (!iframeRef.current) {
        return;
      }
      console.log("adjusting height", height);
      const iframe = (iframeRef.current.children[0] as HTMLIFrameElement);
      iframe.style.minHeight = `calc(100vh - 300px)`;
      iframe.style.height = `${height}px`;
      iframe.setAttribute("scrolling", "no");
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
