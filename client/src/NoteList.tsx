import { Button, Col, Form, Row, Stack, Card, Badge, Modal } from "react-bootstrap"
import { Link } from "react-router-dom"
import CreateableReactSelect from "react-select/creatable"
import { useMemo, useState, useEffect } from "react"
import { notesApi } from "./api"
import type { NoteType, Tag } from "./App"
import "./NoteListModule.css"
import type { FC } from "react"

type NoteCardProps = {
    id: string
    title: string
    tags: Tag[]
    color?: string
    createdAt?: string
    preview?: string
    onPinToggle?: (id: string) => void
    onDuplicate?: (id: string) => void
    isFavorite?: boolean
    onToggleFavorite?: (id: string) => void
    wordCount?: number
    selected?: boolean
    onSelectToggle?: (id: string) => void
}

type EditTagsModalProps = {
    availableTags: Tag[]
    show: boolean
    handleClose: () => void
    onUpdateTag: (id: string, label: string) => void
    onDeleteTag: (id: string) => void
}

type Notebook = { id: string; name: string; parent?: string | null }

function buildTree(items: Notebook[]) {
    const map = new Map<string, Notebook & { children?: any[] }>()
    items.forEach(i => map.set(i.id, { ...i, children: [] }))
    const roots: any[] = []
    map.forEach(node => {
        if (node.parent && map.has(node.parent)) {
            map.get(node.parent)!.children!.push(node)
        } else {
            roots.push(node)
        }
    })
    return roots
}

const NotebookTree: FC<{ notebooks: Notebook[]; onUpdate?: (id: string, data: any) => void; onDelete?: (id: string) => void }> = ({ notebooks, onUpdate, onDelete }) => {
    const roots = buildTree(notebooks)

    function RenderNode({ node, level = 0 }: { node: any; level?: number }) {
        return (
            <div style={{ paddingLeft: level * 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ flex: 1 }}>{node.name}</div>
                <div style={{ display: 'flex', gap: 6 }}>
                    {onUpdate && (
                        <select defaultValue={node.parent || ''} onChange={e => onUpdate(node.id, { parent: e.target.value || null })}>
                            <option value="">Root</option>
                            {notebooks.filter(nb => nb.id !== node.id).map(nb => (
                                <option key={nb.id} value={nb.id}>{nb.name}</option>
                            ))}
                        </select>
                    )}
                    {onDelete && (
                        <Button variant="outline-danger" size="sm" onClick={() => onDelete(node.id)}>Delete</Button>
                    )}
                </div>
            </div>
        )
    }

    function renderList(list: any[], level = 0) {
        return list.map(n => (
            <div key={n.id}>
                <RenderNode node={n} level={level} />
                {n.children && n.children.length > 0 && <div>{renderList(n.children, level + 1)}</div>}
            </div>
        ))
    }

    return <div>{renderList(roots)}</div>
}


function NoteCard({ id, title, tags, color, createdAt, preview, onPinToggle, onDuplicate, isFavorite, onToggleFavorite, wordCount, selected = false, onSelectToggle }: NoteCardProps) {
    function formatDate(d?: string) {
        if (!d) return ''
        try { return new Date(d).toLocaleDateString() } catch { return d }
    }

    return (
        <Card
            as={Link}
            to={`/${id}`}
            className="note-card h-100 text-reset text-decoration-none"
            style={{ borderLeft: `6px solid ${color || '#ffffff'}` }}
        >
            <Card.Body className="note-card-body">
                <div className="d-flex justify-content-between align-items-start">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                        <input
                            type="checkbox"
                            checked={selected}
                            onChange={() => { }}
                            onClick={e => { e.preventDefault(); e.stopPropagation(); onSelectToggle && onSelectToggle(id) }}
                        />
                        <span className="note-card-title text-truncate">{title}</span>
                    </div>
                    <div className="note-card-actions">
                        {onPinToggle && (
                            <Button size="sm" variant="outline-secondary" onClick={e => { e.preventDefault(); e.stopPropagation(); onPinToggle(id) }}>Pin</Button>
                        )}
                        {onDuplicate && (
                            <Button size="sm" variant="outline-secondary" onClick={e => { e.preventDefault(); e.stopPropagation(); onDuplicate(id) }}>Duplicate</Button>
                        )}
                        {onToggleFavorite && (
                            <Button
                                size="sm"
                                variant={isFavorite ? "warning" : "outline-secondary"}
                                onClick={e => { e.preventDefault(); e.stopPropagation(); onToggleFavorite(id) }}
                            >
                                {isFavorite ? "Unfavorite" : "Favorite"}
                            </Button>
                        )}
                    </div>
                </div>
                <div className="mt-2 note-preview-text">
                    {preview}
                </div>
                <div className="text-muted mt-2" style={{ fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>{wordCount ?? 0} words</span>
                    <span>{formatDate(createdAt)}</span>
                </div>
                {tags.length > 0 && (
                    <div className="tagContainer">
                        {tags.map(tag => (
                            <Badge key={tag.id} className="tag">
                                {tag.label}
                            </Badge>
                        ))}
                    </div>
                )}
            </Card.Body>
        </Card>
    )
}


type NoteListProps = {
    availableTags: Tag[]
    notes: NoteType[]
    onUpdateTag: (id: string, label: string) => void
    onDeleteTag: (id: string) => void
    onPinToggle?: (id: string) => void
    onDuplicate?: (id: string) => void
    notebooks?: any[]
    onCreateNotebook?: (data: { name: string; parent?: string }) => void
    onUpdateNotebook?: (id: string, data: any) => void
    onDeleteNotebook?: (id: string) => void
    onSearch?: (params: any) => void
    extraSearchParams?: any
    onNoteUpdated?: (id: string, updated: any) => void
    favoriteIds?: string[]
    onToggleFavorite?: (id: string) => void
}

export function NoteList({ availableTags, notes, onUpdateTag, onDeleteTag, onPinToggle, onDuplicate, notebooks = [], onCreateNotebook, onUpdateNotebook, onDeleteNotebook, onSearch, extraSearchParams, favoriteIds = [], onToggleFavorite }: NoteListProps) {
    const [selectedTags, setSelectedTags] = useState<Tag[]>([])
    const [selectedColors, setSelectedColors] = useState<string[]>([])
    const [selectedNoteIds, setSelectedNoteIds] = useState<string[]>([])
    const [title, setTitle] = useState("")
    const [showEditTagsModal, setShowEditTagsModal] = useState(false)
    const [selectedNotebook, setSelectedNotebook] = useState<string | ''>('')
    const [pinnedOnly, setPinnedOnly] = useState<'any' | 'pinned' | 'unpinned'>('any')
    const [dateFrom, setDateFrom] = useState<string | ''>('')
    const [dateTo, setDateTo] = useState<string | ''>('')
    const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'mostWords' | 'fewestWords'>('newest')
    const [minWords, setMinWords] = useState<number | ''>('')
    const distinctColors = useMemo(() => {
        const set = new Set<string>()
        notes.forEach(n => set.add(n.color || '#ffffff'))
        return Array.from(set)
    }, [notes])

    const filteredNotes = useMemo(() => {
        const countWordsFromHtml = (html: string) => {
            const tmp = document.createElement('div')
            tmp.innerHTML = html || ''
            const text = tmp.textContent || tmp.innerText || ''
            const words = text.trim().split(/\s+/).filter(Boolean)
            return words.length
        }

        const buildPreviewFromHtml = (html: string) => {
            const tmp = document.createElement('div')
            tmp.innerHTML = html || ''
            const text = (tmp.textContent || tmp.innerText || '').trim()
            if (!text) return ''
            if (text.length <= 120) return text
            return text.slice(0, 117) + '...'
        }

        let list = notes.map(note => ({
            ...note,
            wordCount: countWordsFromHtml(note.content || ''),
            preview: buildPreviewFromHtml(note.content || '')
        }))

        if (selectedNotebook) {
            list = list.filter(n => (n.notebook && n.notebook.id === selectedNotebook))
        }

        list = list.filter(note => {
            return (title === "" || note.title.toLowerCase().includes(title.toLowerCase())) &&
                (selectedTags.length === 0 ||
                    selectedTags.every(tag =>
                        note.tags.some(noteTag => noteTag.id === tag.id)
                    )
                )
                && (selectedColors.length === 0 || selectedColors.includes(note.color || '#ffffff'))
                && (minWords === '' || (note.wordCount || 0) >= Number(minWords))
        })

        switch (sortBy) {
            case 'newest':
                list.sort((a, b) => (new Date(b.createdAt || '')).getTime() - (new Date(a.createdAt || '')).getTime())
                break
            case 'oldest':
                list.sort((a, b) => (new Date(a.createdAt || '')).getTime() - (new Date(b.createdAt || '')).getTime())
                break
            case 'mostWords':
                list.sort((a, b) => (b.wordCount || 0) - (a.wordCount || 0))
                break
            case 'fewestWords':
                list.sort((a, b) => (a.wordCount || 0) - (b.wordCount || 0))
                break
        }

        return list
    }, [title, selectedTags, selectedColors, notes, sortBy, minWords])

    function triggerServerSearch() {
        if (!onSearch) return
        const params: any = {}
        if (title) params.q = title
        if (selectedTags.length) params.tags = selectedTags.map(t => t.id).join(',')
        if (selectedColors.length) params.color = selectedColors[0] // server supports single color
        if (selectedNotebook) params.notebook = selectedNotebook
        if (pinnedOnly === 'pinned') params.pinned = 'true'
        if (pinnedOnly === 'unpinned') params.pinned = 'false'
        if (dateFrom) params.dateFrom = dateFrom
        if (dateTo) params.dateTo = dateTo
        if (sortBy) params.sort = sortBy === 'newest' ? 'updatedDesc' : sortBy === 'oldest' ? 'createdAsc' : sortBy === 'mostWords' ? 'updatedDesc' : 'updatedAsc'
        onSearch({ ...params, ...(extraSearchParams || {}) })
    }

    // Saved searches: persist simple filter objects to localStorage
    const [savedSearches, setSavedSearches] = useState<Array<any>>([])
    const [selectedSavedSearchId, setSelectedSavedSearchId] = useState<string>('')

    useEffect(() => {
        try {
            const raw = localStorage.getItem('savedSearches')
            if (raw) setSavedSearches(JSON.parse(raw))
        } catch (e) { }
    }, [])

    function persistSavedSearches(arr: any[]) {
        try { localStorage.setItem('savedSearches', JSON.stringify(arr)) } catch (e) { }
    }

    function buildParamsObjectFromState() {
        const params: any = {}
        if (title) params.q = title
        if (selectedTags.length) params.tags = selectedTags.map(t => t.id).join(',')
        if (selectedColors.length) params.color = selectedColors[0] || ''
        if (selectedNotebook) params.notebook = selectedNotebook
        if (pinnedOnly && pinnedOnly !== 'any') params.pinned = pinnedOnly === 'pinned' ? 'true' : 'false'
        if (dateFrom) params.dateFrom = dateFrom
        if (dateTo) params.dateTo = dateTo
        if (sortBy) params.sort = sortBy
        if (minWords !== '') params.minWords = String(minWords)
        return params
    }

    function saveCurrentSearch() {
        const name = prompt('Name for saved search')
        if (!name) return
        const params = buildParamsObjectFromState()
        const entry = { id: Date.now().toString(), name, params }
        const next = [entry, ...savedSearches].slice(0, 50)
        setSavedSearches(next)
        persistSavedSearches(next)
        setSelectedSavedSearchId(entry.id)
    }

    function renameSavedSearch(id: string) {
        const entry = savedSearches.find(s => s.id === id)
        if (!entry) return
        const name = prompt('Rename saved search', entry.name)
        if (!name) return
        const next = savedSearches.map(s => s.id === id ? { ...s, name } : s)
        setSavedSearches(next)
        persistSavedSearches(next)
    }

    function applySavedSearch(id: string) {
        const entry = savedSearches.find(s => s.id === id)
        if (!entry) return
        const p = entry.params || {}
        setTitle(p.q || '')
        const tagIds: string[] = p.tags ? String(p.tags).split(',') : []
        setSelectedTags(tagIds.map(tid => availableTags.find(t => t.id === tid) || { id: tid, label: 'Unknown' }))
        setSelectedColors(p.color ? [p.color] : [])
        setSelectedNotebook(p.notebook || '')
        setSortBy(p.sort || 'newest')
        setPinnedOnly(p.pinned === 'true' ? 'pinned' : p.pinned === 'false' ? 'unpinned' : 'any')
        setDateFrom(p.dateFrom || '')
        setDateTo(p.dateTo || '')
        setMinWords(p.minWords ? Number(p.minWords) : '')
        setSelectedSavedSearchId(id)
        // trigger server search with normalized params
        if (onSearch) {
            const serverParams: any = {}
            if (p.q) serverParams.q = p.q
            if (tagIds.length) serverParams.tags = tagIds.join(',')
            if (p.color) serverParams.color = p.color
            if (p.notebook) serverParams.notebook = p.notebook
            if (p.sort) serverParams.sort = p.sort === 'newest' ? 'updatedDesc' : p.sort === 'oldest' ? 'createdAsc' : p.sort
            if (p.pinned) serverParams.pinned = p.pinned
            if (p.dateFrom) serverParams.dateFrom = p.dateFrom
            if (p.dateTo) serverParams.dateTo = p.dateTo
            onSearch({ ...serverParams, ...(extraSearchParams || {}) })
        }
    }

    function deleteSavedSearch(id: string) {
        const next = savedSearches.filter(s => s.id !== id)
        setSavedSearches(next)
        persistSavedSearches(next)
        if (selectedSavedSearchId === id) setSelectedSavedSearchId('')
    }

    const topTags = useMemo(() => {
        const counts = new Map<string, number>()
        notes.forEach(n => n.tags.forEach(t => counts.set(t.label, (counts.get(t.label) || 0) + 1)))
        return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 10)
    }, [notes])

    const [bulkTagId, setBulkTagId] = useState<string | ''>('')

    async function handleBulkAddTag(tagId: string) {
        const toUpdate = notes.filter(n => selectedNoteIds.includes(n.id))
        await Promise.all(toUpdate.map(async n => {
            const existing = n.tags.map(t => t.id)
            if (existing.includes(tagId)) return
            const updatedTags = [...existing, tagId]
            try {
                const res = await notesApi.update(n.id, { tags: updatedTags })
                const d = res.data.data
                const mappedTags = (d.tags || []).map((tag: any) => ({ id: tag?._id || tag, label: tag?.name || 'Unknown Tag' }))
                // inform parent to update local state
                if ((arguments[0] as any)?.onNoteUpdated) {
                    /* noop */
                }
                window.dispatchEvent(new CustomEvent('note-updated', { detail: { id: n.id, updated: { tags: mappedTags } } }))
            } catch (e) { }
        }))
        setSelectedNoteIds([])
    }

    async function handleBulkRemoveTag(tagId: string) {
        const toUpdate = notes.filter(n => selectedNoteIds.includes(n.id))
        await Promise.all(toUpdate.map(async n => {
            const existing = n.tags.map(t => t.id)
            if (!existing.includes(tagId)) return
            const updatedTags = existing.filter(x => x !== tagId)
            try {
                const res = await notesApi.update(n.id, { tags: updatedTags })
                const d = res.data.data
                const mappedTags = (d.tags || []).map((tag: any) => ({ id: tag?._id || tag, label: tag?.name || 'Unknown Tag' }))
                window.dispatchEvent(new CustomEvent('note-updated', { detail: { id: n.id, updated: { tags: mappedTags } } }))
            } catch (e) { }
        }))
        setSelectedNoteIds([])
    }

    return (
        <>
            <Row className="align-items-center mb-4">
                <Col>
                    <h1>Notes</h1>
                </Col>
                <Col xs="auto">
                    <Stack gap={2} direction="horizontal">
                        <Link to="/new">
                            <Button variant="primary" className="create-button">Create</Button>
                        </Link>
                        <Button onClick={() => setShowEditTagsModal(true)}
                            variant="outline-secondary">Edit Tags</Button>
                        {onCreateNotebook && (
                            <Button variant="outline-secondary" onClick={() => {
                                const name = prompt('Notebook name')
                                if (!name) return
                                const parent = prompt('Parent notebook id (leave blank for root)')
                                onCreateNotebook({ name, parent: parent || undefined })
                            }}>New Notebook</Button>
                        )}
                    </Stack>
                </Col>
            </Row>

            {notebooks.length > 0 && (
                <Row className="mb-3">
                    <Col>
                        <Card className="p-3 mb-3">
                            <h5>Notebooks</h5>
                            <NotebookTree notebooks={notebooks} onUpdate={onUpdateNotebook} onDelete={onDeleteNotebook} />
                        </Card>
                    </Col>
                    <Col xs={12} md={4} lg={3}>
                        <Card className="p-3 mb-3">
                            <h5>Top Tags</h5>
                            <div>
                                {topTags.map(([label, count]: any) => (
                                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <div>{label}</div>
                                        <div className="text-muted">{count}</div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </Col>
                </Row>
            )}

            <Form className="form-section">
                <Row className="mb-4">
                    <Col xs="auto">
                        <Form.Group controlId="notebook">
                            <Form.Label>Notebook</Form.Label>
                            <Form.Select value={selectedNotebook} onChange={e => {
                                const val = e.target.value
                                setSelectedNotebook(val || '')
                            }}>
                                <option value="">All</option>
                                {(notebooks || []).map(nb => (
                                    <option key={nb.id} value={nb.id}>{nb.name}</option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                    </Col>
                    <Col>
                        <Form.Group controlId="title">
                            <Form.Label>Title</Form.Label>
                            <Form.Control
                                type="text"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                placeholder="Search notes by title..."
                            />
                        </Form.Group>
                    </Col>
                    <Col>
                        <Form.Group controlId="tags">
                            <Form.Label>Tags</Form.Label>
                            <CreateableReactSelect
                                value={selectedTags.map(tag => ({
                                    label: tag.label,
                                    value: tag.id
                                }))}
                                options={availableTags.map(tag => ({
                                    label: tag.label,
                                    value: tag.id
                                }))}
                                onChange={tags => {
                                    setSelectedTags(tags.map(tag => ({
                                        label: tag.label,
                                        id: tag.value
                                    })))
                                }}
                                isMulti
                                placeholder="Filter by tags..."
                            />
                        </Form.Group>
                    </Col>
                    <Col xs="auto" className="d-flex align-items-end">
                        <Form.Group controlId="pinned">
                            <Form.Label>Pinned</Form.Label>
                            <Form.Select value={pinnedOnly} onChange={e => setPinnedOnly(e.target.value as any)}>
                                <option value="any">Any</option>
                                <option value="pinned">Pinned</option>
                                <option value="unpinned">Unpinned</option>
                            </Form.Select>
                        </Form.Group>
                    </Col>
                    <Col xs="auto" className="d-flex align-items-end">
                        <Form.Group>
                            <Form.Label>Date From</Form.Label>
                            <Form.Control type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
                        </Form.Group>
                    </Col>
                    <Col xs="auto" className="d-flex align-items-end">
                        <Form.Group>
                            <Form.Label>Date To</Form.Label>
                            <Form.Control type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
                        </Form.Group>
                    </Col>
                    <Col xs="auto" className="d-flex align-items-end">
                        <div>
                            <Form.Label>Color</Form.Label>
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                {distinctColors.map(c => (
                                    <button
                                        key={c}
                                        title={c}
                                        onClick={() => {
                                            setSelectedColors(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c])
                                        }}
                                        style={{
                                            width: 28,
                                            height: 28,
                                            background: c,
                                            border: selectedColors.includes(c) ? '3px solid #00000033' : '1px solid #00000022',
                                            borderRadius: 4,
                                            cursor: 'pointer'
                                        }}
                                    />
                                ))}
                                {distinctColors.length === 0 && <div className="text-muted">No colors</div>}
                                {distinctColors.length > 0 && (
                                    <button
                                        onClick={() => setSelectedColors([])}
                                        style={{ marginLeft: 6, padding: '4px 8px', borderRadius: 4 }}
                                    >Clear</button>
                                )}
                            </div>
                        </div>
                    </Col>
                    <Col xs="auto" className="d-flex align-items-end">
                        <div>
                            <Form.Label>Sort</Form.Label>
                            <Form.Select value={sortBy} onChange={e => setSortBy(e.target.value as any)}>
                                <option value="newest">Newest</option>
                                <option value="oldest">Oldest</option>
                                <option value="mostWords">Most words</option>
                                <option value="fewestWords">Fewest words</option>
                            </Form.Select>
                        </div>
                    </Col>
                    <Col xs="auto" className="d-flex align-items-end">
                        <div>
                            <Form.Label>&nbsp;</Form.Label>
                            <div className="d-flex" style={{ gap: 8 }}>
                                <Button onClick={() => triggerServerSearch()} variant="outline-primary">Apply Filters</Button>
                                <Button onClick={() => { setTitle(''); setSelectedTags([]); setSelectedColors([]); setSelectedNotebook(''); setMinWords(''); setSortBy('newest'); setPinnedOnly('any'); setDateFrom(''); setDateTo(''); setSelectedSavedSearchId(''); if (onSearch) onSearch(extraSearchParams || {}) }} variant="outline-secondary">Reset</Button>
                            </div>
                            <div className="mt-2 d-flex" style={{ gap: 8, alignItems: 'center' }}>
                                <Form.Select value={selectedSavedSearchId} onChange={e => setSelectedSavedSearchId(e.target.value)} style={{ width: 200 }}>
                                    <option value="">Saved searches</option>
                                    {savedSearches.map(s => (<option key={s.id} value={s.id}>{s.name}</option>))}
                                </Form.Select>
                                <Button disabled={!selectedSavedSearchId} onClick={() => selectedSavedSearchId && applySavedSearch(selectedSavedSearchId)}>Apply</Button>
                                <Button variant="outline-secondary" disabled={!selectedSavedSearchId} onClick={() => selectedSavedSearchId && renameSavedSearch(selectedSavedSearchId)}>Rename</Button>
                                <Button variant="outline-danger" disabled={!selectedSavedSearchId} onClick={() => selectedSavedSearchId && deleteSavedSearch(selectedSavedSearchId)}>Delete</Button>
                                <Button variant="success" onClick={() => saveCurrentSearch()}>Save</Button>
                            </div>
                        </div>
                    </Col>
                </Row>
            </Form>

            {selectedNoteIds.length > 0 && (
                <Row className="mb-3">
                    <Col>
                        <div className="d-flex align-items-center gap-2">
                            <div><strong>{selectedNoteIds.length}</strong> selected</div>
                            <Form.Select value={bulkTagId} onChange={e => setBulkTagId(e.target.value)} style={{ width: 220 }}>
                                <option value="">Select tag...</option>
                                {availableTags.map(t => (<option key={t.id} value={t.id}>{t.label}</option>))}
                            </Form.Select>
                            <Button onClick={() => bulkTagId && handleBulkAddTag(bulkTagId)} disabled={!bulkTagId}>Add Tag</Button>
                            <Button variant="outline-danger" onClick={() => bulkTagId && handleBulkRemoveTag(bulkTagId)} disabled={!bulkTagId}>Remove Tag</Button>
                        </div>
                    </Col>
                </Row>
            )}

            <Row xs={1} sm={2} lg={3} xl={4} className="g-3">
                {filteredNotes.length > 0 ? (
                    filteredNotes.map(note => (
                        <Col key={note.id}>
                            <NoteCard
                                id={note.id}
                                title={note.title}
                                tags={note.tags}
                                color={note.color}
                                createdAt={note.createdAt}
                                preview={note.preview}
                                onPinToggle={onPinToggle}
                                onDuplicate={onDuplicate}
                                isFavorite={favoriteIds.includes(note.id)}
                                onToggleFavorite={onToggleFavorite}
                                selected={selectedNoteIds.includes(note.id)}
                                onSelectToggle={(id) => setSelectedNoteIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])}
                                wordCount={note.wordCount}
                            />
                        </Col>
                    ))
                ) : (
                    <Col xs={12} className="text-center mt-5">
                        <h3 className="text-muted">No notes found</h3>
                        <p className="text-muted">Try changing your search or create a new note!</p>
                    </Col>
                )}
            </Row>
            <EditTagsModal
                onUpdateTag={onUpdateTag}
                onDeleteTag={onDeleteTag}
                availableTags={availableTags}
                show={showEditTagsModal}
                handleClose={() => setShowEditTagsModal(false)}

            />
        </>
    )
}


function EditTagsModal({
    onUpdateTag, onDeleteTag,
    availableTags, show, handleClose }: EditTagsModalProps) {
    return (
        <Modal show={show} onHide={handleClose} >
            <Modal.Header closeButton>
                <Modal.Title>Edit Tags</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Stack gap={2}>
                        {
                            availableTags.map(tag => (
                                <Row key={tag.id}>
                                    <Col>
                                        <Form.Control type="text" value={tag.label}
                                            onChange={e => onUpdateTag(tag.id, e.target.value)} />
                                    </Col>
                                    <Col xs="auto">
                                        <Button variant="outline-danger" onClick={() => onDeleteTag(tag.id)}>&times;</Button>
                                    </Col>
                                </Row>
                            ))
                        }
                    </Stack>
                </Form>

            </Modal.Body>
        </Modal>

    )
}
