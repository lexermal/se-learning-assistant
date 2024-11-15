"use client";

import Postmate from "postmate";
import { useEffect, useRef, useState } from "react";

interface Plugin {
  url: string;
  name: string;
  description: string;
}

export default function PluginPage({ params }: any) {
  const iframeRef = useRef(null);
  const [plugin, setPlugin] = useState(null as Plugin | null);

  useEffect(() => {
    params.then(async ({ pluginName }: any) => {
      const allowedPlugin = await fetch(`/api/plugins`)
        .then(res => res.json())
        .then((data) => data.filter((plugin: any) => plugin.name === pluginName));

      // Allowed plugins for security
      if (allowedPlugin.length > 0) {
        setPlugin(allowedPlugin[0]);
      }
    });
  }, []);

  useEffect(() => {
    if (!iframeRef.current) {
      return;
    }
    let pluginConnection: Postmate;

    // Initialize Postmate Parent
    const initializePlugin = async () => {
      pluginConnection = new Postmate({
        container: iframeRef.current,
        url: plugin!.url,
      });

      // Wait for the plugin to be ready
      const plugin2 = await pluginConnection;

      // Call plugin method and get data
      plugin2.on("helloFromAlex", (data: any) => {
        console.log("Plugin says dynamically: ", data);
      });

      const data = await plugin2.get("exampleProp");
      console.log("Plugin property: ", data);

      console.log("height:", await plugin2.get("height"))
    };

    initializePlugin();

    return () => {
      // Clean up Postmate connection
      if (pluginConnection) {
        pluginConnection.then(child => child.destroy());
      }
    };
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
        style={{ border: "1px solid #ccc" }}
      ></div>
    </div>
  );
}
