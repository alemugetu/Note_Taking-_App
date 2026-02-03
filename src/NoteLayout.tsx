import { Navigate, Outlet, useOutletContext, useParams } from "react-router-dom";
import type { NoteType } from "./App";

type NoteLayoutProps = {
    notes: NoteType[]
}

export function NoteLayout({ notes }: NoteLayoutProps) {
    const { id } = useParams<{ id: string }>();
    const note = notes.find(n => n.id === id);
    if(note == null) {
        return <Navigate to="/" replace />;
    }
    return <Outlet context={note} />;
}

export function useNote() {
    return useOutletContext<NoteType>();
}