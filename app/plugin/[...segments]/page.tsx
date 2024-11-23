"use client";

import { useEffect, useState } from "react";
import { Plugin } from "../CommunicationHandler";
import MainPluginHandler from "../../../components/plugin/MainPluginHandler";
import { EventEmitterProvider } from "@/utils/providers/EventEmitterContext";
import { PluginSidebar } from "../../../components/plugin/SidebarPluginHandler";

export default function PluginPage({ params }: { params: Promise<{ segments: string[] }> }) {
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [mainPluginIndex, setMainPluginIndex] = useState(-1);

  useEffect(() => {
    fetch(`/api/plugins`)
      .then(res => res.json())
      .then(async data => {
        const { segments: [pluginName] } = await params;
        setPlugins(data);
        setMainPluginIndex(data.findIndex((p: Plugin) => p.name === pluginName));
      });
  }, []);

  if (!plugins || mainPluginIndex === -1) {
    return <div>Loading... makr sure you are logged in</div>;
  }

  console.log(plugins);

  return (
    <EventEmitterProvider>
      <div>
        <div className="flex space-x-4">
          <MainPluginHandler plugin={plugins[mainPluginIndex]}
            globalContextMenuActions={plugins.flatMap(p => p.contextMenuActions)} />
          <PluginSidebar plugins={plugins} />
        </div>
      </div>
    </EventEmitterProvider>
  );
}
