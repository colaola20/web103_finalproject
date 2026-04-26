import { SquarePen, Trash2 } from "lucide-react"
import '../styles/Note.css'
import {getNoteTags} from '../services/api'
import {useEffect, useState} from 'react'

const Note = ({ note, onEdit, onDelete }) => {
  const [tags, setTags] = useState([])

  useEffect(() => {
    const fetchTags = async () => {
      const data = await getNoteTags(note.id)
      setTags(data)
    }
    fetchTags()
  }, [note.id])
  console.log(tags)


  return (
    <div className="note-card" style={{ backgroundColor: note.color }}>
      <div className="note-header">
        <h3>{note.title}</h3>
        {note.is_pinned && <span className="pin-icon">📌</span>}
      </div>
      <p className="note-content">{note.content}</p>
      {tags.length > 0 && (
        <div className="note-tags">
          {tags.map(tag => (
            <span key={tag.id} className="tag">#{tag.name}</span>
          ))}
        </div>
      )}
      <div className="note-footer">
        <button onClick={() => onEdit(note)} className="icon-btn"><SquarePen color='#666666' size={20} /></button>
        <button onClick={() => onDelete(note.id)} className="icon-btn"><Trash2 color='#666666' size={20} /></button>
      </div>
    </div>
  );
};

export default Note;
