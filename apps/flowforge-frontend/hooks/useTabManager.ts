"use client";

import { useState, useCallback } from "react";

export type WorkspaceTab = {
  id: string; // "dashboard" or "note_<id>" or "whiteboard_<slug>" or "settings"
  title: string;
  type: "dashboard" | "note" | "whiteboard" | "settings";
  entityId?: string; // actual note ID or room slug
};

export function useTabManager() {
  const [tabs, setTabs] = useState<WorkspaceTab[]>([
    { id: "dashboard", title: "Dashboard", type: "dashboard" },
    { id: "settings", title: "Settings", type: "settings" }
  ]);
  const [activeTabId, setActiveTabId] = useState<string>("dashboard");

  const openTab = useCallback((type: "note" | "whiteboard" | "settings", entityId: string, title: string) => {
    const tabId = type === "settings" ? "settings" : `${type}_${entityId}`;
    const existingTab = tabs.find((t) => t.id === tabId);
    if (existingTab) {
      setActiveTabId(tabId);
    } else {
      const newTab: WorkspaceTab = { id: tabId, title, type, entityId };
      setTabs([...tabs, newTab]);
      setActiveTabId(tabId);
    }
  }, [tabs]);

  const closeTab = useCallback((tabId: string) => {
    const tabIndex = tabs.findIndex((t) => t.id === tabId);
    const newTabs = tabs.filter((t) => t.id !== tabId);
    setTabs(newTabs);
    if (activeTabId === tabId) {
      const nextActiveTab = newTabs[tabIndex - 1] || newTabs[0];
      if (nextActiveTab) setActiveTabId(nextActiveTab.id);
      else setActiveTabId("dashboard");
    }
  }, [tabs, activeTabId]);

  return { tabs, activeTabId, setActiveTabId, openTab, closeTab };
}
