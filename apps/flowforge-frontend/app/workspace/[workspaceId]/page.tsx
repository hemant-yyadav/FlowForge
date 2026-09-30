"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../../../hooks/useAuth";
import { useNotes, useWorkspaceRooms } from "../../../hooks/useNotes";
import { useFavorites, useToggleNoteFavorite, useToggleRoomFavorite } from "../../../hooks/useFavorites";
import { useTabManager } from "../../../hooks/useTabManager";
import { TabBar } from "../../../components/workspace/TabBar";
import { FilterBar } from "../../../components/workspace/FilterBar";
import { EmptyState } from "../../../components/workspace/EmptyState";
import { CreateContentModal } from "../../../components/workspace/CreateContentModal";
import { ContentCard } from "../../../components/workspace/Card";
import { NoteEditorEmbed } from "../../../components/workspace/NoteEditorEmbed";
import { WhiteboardEmbed } from "../../../components/workspace/WhiteboardEmbed";
import { SearchX, LayoutDashboard } from "lucide-react";

export default function WorkspaceDashboard() {
    const { workspaceId } = useParams<{workspaceId: string}>();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { token } = useAuth();
    
    const { data: notesData, isLoading: notesLoading } = useNotes(workspaceId, token);
    const { data: roomsData, isLoading: roomsLoading } = useWorkspaceRooms(workspaceId, token);
    const { data: favData } = useFavorites(token);

    const toggleNoteFav = useToggleNoteFavorite(token);
    const toggleRoomFav = useToggleRoomFavorite(token);

    const { tabs, activeTabId, setActiveTabId, openTab, closeTab } = useTabManager();

    const [search, setSearch] = useState("");
    const [showCreate, setShowCreate] = useState(false);

    const [filter, setFilter] = useState(() => searchParams.get("filter") || "All");

    // Sync from URL when it changes
    useEffect(() => {
        const urlFilter = searchParams.get("filter");
        if (urlFilter && urlFilter !== filter) {
            setFilter(urlFilter);
        } else if (!urlFilter && filter !== "All") {
            setFilter("All");
        }
    }, [searchParams]);

    const handleFilterChange = (newFilter: string) => {
        setFilter(newFilter);
        if (newFilter === "All") {
            router.replace(`/workspace/${workspaceId}`, { scroll: false });
        } else {
            router.replace(`/workspace/${workspaceId}?filter=${newFilter}`, { scroll: false });
        }
    };

    // Deep Linking Support
    useEffect(() => {
        const openParam = searchParams.get("open");
        if (openParam) {
            const [type, id] = openParam.split("_");
            if (type && id) {
                // Find title if possible, or use a default
                let title = type === "note" ? "Note" : "Whiteboard";
                if (type === "note" && notesData?.notes) {
                    const n = notesData.notes.find((n:any) => n.id === id);
                    if (n) title = n.title;
                }
                if (type === "whiteboard" && roomsData?.rooms) {
                    const r = roomsData.rooms.find((r:any) => r.slug === id);
                    if (r) title = r.slug;
                }
                openTab(type as "note"|"whiteboard", id, title);
                // Clear the param so it doesn't reopen on refresh unless intended
                router.replace(`/workspace/${workspaceId}`, { scroll: false });
            }
        }
    }, [searchParams, notesData, roomsData, openTab, router, workspaceId]);

    const notes = notesData?.notes || [];
    const rooms = roomsData?.rooms || [];
    const favorites = favData?.favorites || [];
    const favNoteIds = new Set(favorites.filter((f: any) => f.noteId).map((f: any) => f.noteId));
    const favRoomIds = new Set(favorites.filter((f: any) => f.roomId).map((f: any) => f.roomId));

    // Combine notes and rooms into a unified content array
    const allContent = [
        ...notes.map((n: any) => ({ ...n, _type: "note", _isFav: favNoteIds.has(n.id), _date: n.updatedAt })),
        ...rooms.map((r: any) => ({ ...r, _type: "whiteboard", _isFav: favRoomIds.has(r.id), _date: r.createdAt, title: r.slug }))
    ];

    allContent.sort((a,b) => new Date(b._date).getTime() - new Date(a._date).getTime());

    const filteredContent = allContent.filter(c => {
        if (filter === "Notes" && c._type !== "note") return false;
        if (filter === "Whiteboards" && c._type !== "whiteboard") return false;
        if (filter === "Favorites" && !c._isFav) return false;
        if (search) {
            const matchTitle = c.title.toLowerCase().includes(search.toLowerCase());
            const matchTag = c._type === "note" && c.tags?.some((t:any) => t.name.toLowerCase().includes(search.toLowerCase()));
            if (!matchTitle && !matchTag) return false;
        }
        return true;
    });

    const activeTab = tabs.find(t => t.id === activeTabId);
    const isLoading = notesLoading || roomsLoading;

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "var(--bg-primary)" }}>
            <TabBar tabs={tabs} activeTabId={activeTabId} onTabClick={setActiveTabId} onTabClose={closeTab} />
            
            <div style={{ flex: 1, overflowY: "auto", padding: "0 32px 32px 32px" }}>
                <CreateContentModal 
                    workspaceId={workspaceId} 
                    token={token!} 
                    open={showCreate} 
                    onClose={() => setShowCreate(false)} 
                    onNoteCreated={(id, title, type = "note") => openTab(type, id, title)}
                />

                {activeTab?.type === "dashboard" && (
                    <div style={{ maxWidth: "1200px", margin: "0 auto", animation: "fadeIn 0.3s ease" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", marginTop: "16px" }}>
                            <div>
                                <h1 style={{ fontSize: "1.5rem", margin: 0, color: "var(--text-primary)" }}>My Brain / Dashboard</h1>
                                <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: "4px 0 0 0" }}>{allContent.length} items saved</p>
                            </div>
                            <button className="btn-primary" onClick={() => setShowCreate(true)}>+ Add Content</button>
                        </div>

                        <FilterBar filter={filter} setFilter={handleFilterChange} search={search} setSearch={setSearch} />

                        {isLoading ? (
                            <div style={{ textAlign: "center", padding: "64px", color: "var(--text-muted)" }}>Loading workspace...</div>
                        ) : (
                            <>
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" }}>
                                    {filteredContent.map(c => (
                                        <ContentCard 
                                            key={`${c._type}_${c.id}`}
                                            type={c._type}
                                            id={c.id.toString()}
                                            title={c.title}
                                            preview={c._type === "note" ? (typeof c.content === "object" ? c.content?.text : c.content)?.substring(0,80) : "Interactive Canvas"}
                                            tags={c.tags}
                                            date={c._date}
                                            isFavorite={c._isFav}
                                            onToggleFavorite={(e) => {
                                                if (c._type === "note") toggleNoteFav.mutate(c.id);
                                                else toggleRoomFav.mutate(c.id);
                                            }}
                                            onClick={() => openTab(c._type, c._type === "note" ? c.id : c.slug, c.title)}
                                        />
                                    ))}
                                </div>

                                {allContent.length === 0 && !isLoading && (
                                    <EmptyState 
                                        icon={<LayoutDashboard size={48} />}
                                        title="Your workspace is empty"
                                        subtitle="Click to add your first piece of content"
                                        action={<button className="btn-primary" onClick={() => setShowCreate(true)}>+ Add Content</button>}
                                    />
                                )}

                                {allContent.length > 0 && filteredContent.length === 0 && (
                                    <EmptyState 
                                        icon={<SearchX size={48} />}
                                        title="No results found"
                                        subtitle="Try a different search or filter"
                                    />
                                )}
                            </>
                        )}
                    </div>
                )}

                {activeTab?.type === "note" && <NoteEditorEmbed noteId={activeTab.entityId!} workspaceId={workspaceId} />}
                {activeTab?.type === "whiteboard" && <WhiteboardEmbed slug={activeTab.entityId!} />}
            </div>
        </div>
    );
}
