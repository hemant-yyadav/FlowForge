"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../../../hooks/useAuth";
import { useNotes, useWorkspaceRooms, useDeleteNote, useDeleteWorkspaceRoom } from "../../../hooks/useNotes";
import { useWorkspace } from "../../../hooks/useWorkspaces";
import { useFavorites, useToggleNoteFavorite, useToggleRoomFavorite } from "../../../hooks/useFavorites";
import { useActiveRooms } from "../../../hooks/useActiveRooms";
import { useTabManager } from "../../../hooks/useTabManager";
import { TabBar } from "../../../components/workspace/TabBar";
import { FilterBar } from "../../../components/workspace/FilterBar";
import { EmptyState } from "../../../components/workspace/EmptyState";
import { CreateContentModal } from "../../../components/workspace/CreateContentModal";
import { ConfirmationModal } from "../../../components/workspace/ConfirmationModal";
import { ContentCard } from "../../../components/workspace/Card";
import toast from "react-hot-toast";
import { NoteEditorEmbed } from "../../../components/workspace/NoteEditorEmbed";
import { WhiteboardEmbed } from "../../../components/workspace/WhiteboardEmbed";
import { WorkspaceSettings } from "../../../components/workspace/WorkspaceSettings";
import { JoinRoomModal } from "../../../components/workspace/JoinRoomModal";
import { SearchX, LayoutDashboard, FileText, Presentation, Users, Settings } from "lucide-react";

export default function WorkspaceDashboard() {
    const { workspaceId } = useParams<{workspaceId: string}>();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { token, user } = useAuth();
    
    const { data: wsData, isLoading: wsLoading } = useWorkspace(workspaceId, token);
    const { data: notesData, isLoading: notesLoading } = useNotes(workspaceId, token);
    const { data: roomsData, isLoading: roomsLoading } = useWorkspaceRooms(workspaceId, token);
    const { data: activeRooms = [] } = useActiveRooms();
    const { data: favData } = useFavorites(token);

    let currentUserRole = "VIEWER";
    if (wsData?.workspace && user) {
        const uid = (user as any).userId || user.id;
        if (wsData.workspace.ownerId === uid) {
            currentUserRole = "OWNER";
        } else {
            const member = wsData.workspace.members?.find((m: any) => m.userId === uid);
            if (member) currentUserRole = member.role;
        }
    }

    const toggleNoteFav = useToggleNoteFavorite(token);
    const toggleRoomFav = useToggleRoomFavorite(token);

    const deleteNote = useDeleteNote(workspaceId, token);
    const deleteRoom = useDeleteWorkspaceRoom(workspaceId, token);

    const { tabs, activeTabId, setActiveTabId, openTab, closeTab } = useTabManager();

    const [search, setSearch] = useState("");
    const [showCreate, setShowCreate] = useState<{ open: boolean, defaultType: "note" | "whiteboard" }>({ open: false, defaultType: "note" });
    const [showJoinRoom, setShowJoinRoom] = useState(false);
    const [deleteModal, setDeleteModal] = useState<{ open: boolean, type: "note" | "whiteboard" | null, id: string | number | null, title: string }>({ open: false, type: null, id: null, title: "" });

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

    const confirmDelete = async () => {
        if (!deleteModal.id || !deleteModal.type) return;

        const toastId = toast.loading(`Deleting ${deleteModal.type}...`);
        try {
            if (deleteModal.type === "note") {
                await deleteNote.mutateAsync(deleteModal.id as string);
            } else {
                await deleteRoom.mutateAsync(deleteModal.id as number);
            }
            
            // Find if this content has an open tab
            const entityIdentifier = deleteModal.type === "note" ? deleteModal.id : roomsData?.rooms?.find((r:any) => r.id === deleteModal.id)?.slug;
            const openTabItem = tabs.find(t => t.type === deleteModal.type && t.entityId === entityIdentifier);
            
            if (openTabItem) {
                closeTab(openTabItem.id);
            }

            toast.success(`${deleteModal.type === "note" ? "Note" : "Whiteboard"} deleted successfully`, { id: toastId });
            setDeleteModal({ open: false, type: null, id: null, title: "" });
        } catch (e) {
            toast.error(`Failed to delete ${deleteModal.type}. Please try again.`, { id: toastId });
            setDeleteModal({ open: false, type: null, id: null, title: "" });
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
            <TabBar 
                tabs={tabs} 
                activeTabId={activeTabId} 
                onTabClick={setActiveTabId} 
                onTabClose={closeTab} 
                user={user}
                onLogout={() => {
                    localStorage.removeItem("token");
                    window.location.href = "/signin";
                }}
            />
            
            <div style={{ flex: 1, overflowY: "auto", padding: "0 32px 32px 32px" }}>
                <CreateContentModal 
                    workspaceId={workspaceId} 
                    token={token!} 
                    open={showCreate.open} 
                    defaultType={showCreate.defaultType}
                    onClose={() => setShowCreate({ open: false, defaultType: "note" })} 
                    onNoteCreated={(id, title, type = "note") => openTab(type, id, title)}
                />
                
                <JoinRoomModal
                    open={showJoinRoom}
                    onClose={() => setShowJoinRoom(false)}
                    onJoin={(slug) => openTab("whiteboard", slug, slug)}
                />
                
                <ConfirmationModal 
                    open={deleteModal.open}
                    title="Delete Content"
                    message={`Are you sure you want to delete "${deleteModal.title}"? This action cannot be undone.`}
                    onConfirm={confirmDelete}
                    onCancel={() => setDeleteModal({ ...deleteModal, open: false })}
                    confirmText="Delete"
                    isLoading={deleteNote.isPending || deleteRoom.isPending}
                />

                {activeTab?.type === "dashboard" && (
                    <div style={{ maxWidth: "1200px", margin: "0 auto", animation: "fadeIn 0.3s ease" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", marginTop: "16px" }}>
                            <div>
                                <h1 style={{ fontSize: "1.5rem", margin: 0, color: "var(--text-primary)" }}>My Brain / Dashboard</h1>
                                <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: "4px 0 0 0" }}>{allContent.length} items saved</p>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap", justifyContent: "flex-end" }}>
                                <div style={{ display: "flex", background: "var(--bg-input)", borderRadius: "12px", padding: "6px", border: "1px solid var(--border)", gap: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>
                                    <button 
                                        onClick={() => setShowJoinRoom(true)}
                                        style={{ display: "flex", alignItems: "center", gap: "8px", background: "transparent", color: "var(--text-primary)", padding: "8px 16px", borderRadius: "8px", border: "none", cursor: "pointer", transition: "all 0.2s", fontWeight: 500 }}
                                        onMouseOver={e => e.currentTarget.style.background = "var(--bg-card)"}
                                        onMouseOut={e => e.currentTarget.style.background = "transparent"}
                                    >
                                        <Users size={18} color="var(--accent)" /> Join Meeting
                                    </button>

                                    <div style={{ width: "1px", background: "var(--border)", margin: "4px 0" }} />

                                    {currentUserRole !== "VIEWER" && (
                                        <>
                                            <button 
                                                className="btn-primary" 
                                                onClick={() => setShowCreate({ open: true, defaultType: "whiteboard" })} 
                                                style={{ padding: "8px 16px", display: "flex", alignItems: "center", gap: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.2)" }}
                                            >
                                                <Presentation size={18} /> New Meeting
                                            </button>
                                            
                                            <button 
                                                onClick={() => setShowCreate({ open: true, defaultType: "note" })} 
                                                style={{ padding: "8px 16px", background: "var(--accent-glow)", color: "var(--accent)", display: "flex", alignItems: "center", gap: "8px", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: 600, transition: "0.2s" }}
                                                onMouseOver={e => e.currentTarget.style.background = "var(--border)"}
                                                onMouseOut={e => e.currentTarget.style.background = "var(--accent-glow)"}
                                            >
                                                <FileText size={18} /> New Note
                                            </button>
                                        </>
                                    )}
                                </div>

                                {currentUserRole !== "VIEWER" && (
                                    <button 
                                        onClick={() => openTab("settings", "settings", "Settings")}
                                        style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "44px", height: "44px", background: "var(--bg-input)", border: "1px solid var(--border)", borderRadius: "12px", color: "var(--text-secondary)", cursor: "pointer", transition: "all 0.2s", boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}
                                        onMouseOver={e => { e.currentTarget.style.background = "var(--bg-card)"; e.currentTarget.style.color = "var(--text-primary)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                                        onMouseOut={e => { e.currentTarget.style.background = "var(--bg-input)"; e.currentTarget.style.color = "var(--text-secondary)"; e.currentTarget.style.transform = "translateY(0)"; }}
                                        title="Workspace Settings"
                                    >
                                        <Settings size={22} />
                                    </button>
                                )}
                            </div>
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
                                            isLive={c._type === "whiteboard" ? activeRooms.includes(c.slug) : undefined}
                                            onToggleFavorite={(e) => {
                                                if (c._type === "note") toggleNoteFav.mutate(c.id);
                                                else toggleRoomFav.mutate(c.id);
                                            }}
                                            onClick={() => openTab(c._type, c._type === "note" ? c.id : c.slug, c.title)}
                                            onDelete={currentUserRole !== "VIEWER" ? () => setDeleteModal({ open: true, type: c._type, id: c.id, title: c.title }) : undefined}
                                        />
                                    ))}
                                </div>

                                {allContent.length === 0 && !isLoading && (
                                    <EmptyState 
                                        icon={<LayoutDashboard size={48} />}
                                        title="Your workspace is empty"
                                        subtitle="Click to add your first piece of content"
                                        action={<button className="btn-primary" onClick={() => setShowCreate({ open: true, defaultType: "note" })}>+ Add Content</button>}
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
                {activeTab?.type === "settings" && <WorkspaceSettings workspaceId={workspaceId} />}
            </div>
        </div>
    );
}
