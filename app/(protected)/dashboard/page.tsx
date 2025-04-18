"use client";

import React, { useEffect, useState } from 'react';
import { Plugin, SidebarPage } from "../../../utils/plugin/CommunicationHandler";
import { SidebarPluginHandler } from '@/components/plugin/SidebarPluginHandler';
import { useEventEmitter } from '@/utils/providers/EventEmitterContext';
import { ContextMenuAction } from '@/components/plugin/ContextMenu';
import { SupabaseClient } from '@/utils/supabase/client';

const LandingPage = () => {
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlugins = async () => {
      try {
        setPlugins(await SupabaseClient.getPlugins());
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPlugins();
  }, []);

  if (loading) return <div className="text-center mt-20"></div>;
  if (error) return <div className="text-center mt-20 text-red-500">Error: {error}</div>;

  const sidebarPages = plugins.flatMap((plugin) => plugin.sidebar_pages.map(page => ({ ...page, pluginId: plugin.id })));

  console.log(sidebarPages, plugins);

  return (
    <div className="flex flex-row">
      <div className='w-full p-1 sm:p-6'>
        {/* Welcome Banner */}
        <header className="text-center p-6 mb-5">
          <h1 className="text-3xl font-bold">Welcome to Rimori - The Language Learning Platform!</h1>
          <p className="mt-2">Discover and use tools to enhance your learning experience. </p>
        </header>

        <h2 className="text-2xl font-semibold dark:text-gray-300 mb-1">Features</h2>
        {/* Main Plugin Section */}
        {plugins.map((mainPlugin, index) => (
          <section key={index} className="mb-3 flex flex-col p-4 bg-slate-500 dark:bg-gray-900 rounded-lg">
            <PluginDescription title={mainPlugin.title} description={mainPlugin.description} iconUrl={mainPlugin.icon_url} />

            <div className="flex flex-row flex-wrap gap-4">
              {mainPlugin.plugin_pages.map((page) => (
                <PageButton key={page.url} url={`/plugin/${mainPlugin.id}#${page.url}`} name={page.name} description={page.description} />
              ))}
            </div>
          </section>
        ))}

        <div className="mt-8 mb-20">
          <h4 className="text-md font-semibold dark:text-gray-300 text-2xl">Sidebar Action</h4>
          <p className="dark:text-gray-400">Quickly access tools from the sidebar at the top right.</p>
          <div className="flex flex-row flex-wrap gap-4 pt-2">
            {sidebarPages.map((page) => (
              <SidebarButton key={page.url} page={page} pluginId={page.pluginId} />
            ))}
          </div>
        </div>
      </div>
      <SidebarPluginHandler plugins={plugins} />
    </div>
  );
};

function PluginDescription({ title, description, iconUrl }: { title: string, description: string, iconUrl?: string }) {
  return <div className='pb-5 rounded-lg flex items-center'>
    <img src={iconUrl} alt={title} className="w-16 h-16 rounded-md" />
    <div className="ml-3">
      <h3 className="text-2xl font-bold">{title}</h3>
      <p className="dark:text-gray-200">{description}</p>
    </div>
  </div>
}

function PageButton({ url, name, description }: { url: string, name: string, description: string }) {
  return <div className="p-2 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-lg shadow-sm w-full md:w-1/3 bg-gray-400 hover:bg-gray-300">
    <a href={url} className="">
      <div className="ml-2">
        <h3 className="text-xl font-bold">{name}</h3>
        <p className="dark:text-gray-300 text-base ">{description}</p>
      </div>
    </a>
  </div>
}

function SidebarButton(props: { page: SidebarPage, pluginId: string }) {
  const { name, description, icon_url: iconUrl, actionKey } = props.page;
  const { emit } = useEventEmitter();

  return <div className="flex flex-row items-center p-2 pl-4 bg-gray-400 hover:bg-gray-500 dark:bg-gray-800 dark:hover:bg-gray-700 
  rounded-lg shadow-sm w-full md:w-1/3 cursor-pointer" onClick={() => {
      emit("contextMenuAction", { actionKey, text: "", pluginId: props.pluginId } as ContextMenuAction);
    }}>
    <img src={iconUrl} alt={name} className="w-14 h-14" />
    <div className="ml-3">
      <h3 className="text-2xl font-bold">{name}</h3>
      <p className="dark:text-gray-200">{description}</p>
    </div>
  </div>
}

export default LandingPage;
