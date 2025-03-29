"use client";

import { useEffect, useState } from "react";
import { Plugin } from "../../../../utils/plugin/CommunicationHandler";
import MainPluginHandler from "../../../../components/plugin/MainPluginHandler";
import { EventEmitterProvider } from "@/utils/providers/EventEmitterContext";
import { SidebarPluginHandler } from "../../../../components/plugin/SidebarPluginHandler";
import { SupabaseClient } from "@/utils/supabase/client";

export default function PluginPage({ params }: { params: Promise<{ pluginName: string }> }) {
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [mainPluginIndex, setMainPluginIndex] = useState(-1);

  useEffect(() => {
    SupabaseClient.getPlugins().then(async (data) => {
      const { pluginName } = await params;
      setPlugins(data);
      setMainPluginIndex(data.findIndex((p: Plugin) => p.id === pluginName));
      });
  }, []);

  if (!plugins || mainPluginIndex === -1) {
    return <div></div>;
  }

  return (
    <EventEmitterProvider>
      <div className="flex">
        <MainPluginHandler plugin={plugins[mainPluginIndex]}
          globalContextMenuActions={plugins.flatMap(p => p.context_menu_actions)} />
        <SidebarPluginHandler plugins={plugins} />
      </div>
    </EventEmitterProvider>
  );
}
