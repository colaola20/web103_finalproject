import { SquarePen, Trash2 } from "lucide-react"
import '../styles/Note.css'

const Note = ({ note, onEdit, onDelete }) => {
  return (
    <div className="note-card" style={{ backgroundColor: note.color }}>
      <div className="note-header">
        <h3>{note.title}</h3>
        {note.is_pinned && <span className="pin-icon">📌</span>}
      </div>
      <p className="note-content">{note.content}</p>
      {note.category_name && (
        <div className="note-tags">
          <span className="tag">#{note.category_name}</span>
        </div>
      )}
      <div className="note-footer">
        <button onClick={() => onEdit(note)} className="icon-btn"><SquarePen size={14} /></button>
        <button onClick={() => onDelete(note.id)} className="icon-btn"><Trash2 size={14} /></button>
      </div>
    </div>
  );
};

export default Note;
