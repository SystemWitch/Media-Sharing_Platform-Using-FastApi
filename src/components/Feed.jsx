import { useEffect, useState } from "react";
import { fetchMedia, deleteMedia } from "../api";
import { getCurrentUsername } from "../auth";

export default function Feed() {
  const [media, setMedia] = useState([]);
  const username = getCurrentUsername();

  async function load() {
    setMedia(await fetchMedia());
  }

  async function handleDelete(id) {
    await deleteMedia(id);
    load();
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="grid">
      {media.map(m => (
        <div key={m.id} className="media-card">
          <img src={m.file_url} />

          {/* OWNER ONLY */}
          {m.owner?.username === username && (
            <button className="delete" onClick={() => handleDelete(m.id)}>
              Delete
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
