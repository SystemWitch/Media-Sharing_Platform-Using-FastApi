import { uploadMedia } from "../api";

export default function Upload({ onUpload }) {
  async function handleChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    await uploadMedia(file);
    onUpload();
  }

  return (
    <div className="card">
      <h3>Upload Media</h3>
      <input type="file" onChange={handleChange} />
    </div>
  );
}
