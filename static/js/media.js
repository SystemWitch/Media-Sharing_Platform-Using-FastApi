document.addEventListener('DOMContentLoaded', () => {
  loadMedia();

  const uploadForm = document.getElementById('upload-form');
  if (uploadForm) {
    uploadForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const fileInput = document.getElementById('file-input');
      const file = fileInput?.files?.[0];
      if (!file) return alert('Please select a file 🌈');

      const token = localStorage.getItem('token');
      if (!token) return alert('Please log in first');

      const formData = new FormData();
      formData.append('file', file);

      const btn = document.getElementById('upload-btn') || e.submitter;
      btn.disabled = true;
      btn.textContent = 'Uploading magic... ✨';

      try {
        const res = await fetch('/upload', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData
        });

        if (res.ok) {
          alert('Upload successful! ✨');
          fileInput.value = '';
          await loadMedia();
        } else {
          const err = await res.json();
          alert(err.detail || 'Upload failed');
        }
      } catch (err) {
        alert('Network error: ' + err.message);
      } finally {
        btn.disabled = false;
        btn.textContent = 'Upload Now';
      }
    });
  }
});

async function loadMedia() {
    const grid = document.getElementById('media-grid');
    if (!grid) {
        console.error("Cannot find #media-grid");
        return;
    }

    const token = localStorage.getItem('token');
    const isLoggedIn = !!token;

    // Choose endpoint
    const endpoint = isLoggedIn ? '/api/media' : '/api/public-media';

    grid.innerHTML = '<p class="col-span-full text-center py-8 text-gray-500">Loading media...</p>';

    try {
        const fetchOptions = {
            cache: 'no-store'
        };

        if (isLoggedIn) {
            fetchOptions.headers = {
                'Authorization': `Bearer ${token}`
            };
        }

        const res = await fetch(endpoint, fetchOptions);

        if (!res.ok) {
            if (res.status === 401) {
                localStorage.removeItem('token');
                window.location.href = '/login?expired=1';
                return;
            }
            throw new Error(`Server responded with ${res.status}`);
        }

        const mediaItems = await res.json();

        grid.innerHTML = '';

        if (!mediaItems?.length) {
            grid.innerHTML = '<p class="col-span-full text-center py-12 text-gray-600">' +
                (isLoggedIn ? "You haven't uploaded any media yet." : "No media has been uploaded yet.") +
                '</p>';
            return;
        }

        mediaItems.forEach(item => {
            const card = document.createElement('div');
            card.className = 'bg-white rounded-lg shadow overflow-hidden';

            const img = document.createElement('img');
            img.src = item.file_url;
            img.alt = item.file_name || 'media';
            img.className = 'w-full h-48 object-cover';

            const body = document.createElement('div');
            body.className = 'p-4';

            const title = document.createElement('h3');
            title.className = 'font-medium text-gray-900 truncate';
            title.textContent = item.file_name || 'Untitled';

            const meta = document.createElement('p');
            meta.className = 'text-sm text-gray-500 mt-1';
            meta.textContent = `${(item.file_size / 1024 / 1024).toFixed(2)} MB • ${item.file_type || '?'}`;

            // Show uploader (always present in public endpoint, optional in private)
            const uploader = document.createElement('p');
            uploader.className = 'text-sm text-gray-600 mt-2 italic';
            uploader.textContent = `Uploaded by ${item.uploader_username || 'Unknown'}`;

            const delBtn = document.createElement('button');
            delBtn.textContent = 'Delete';
            delBtn.className = 'mt-3 text-sm text-red-600 hover:text-red-800 font-medium';
            delBtn.onclick = () => {
                if (confirm(`Delete "${item.file_name || 'this file'}"?`)) {
                    deleteMedia(item.id);
                }
            };

            // Only show delete button if logged in (and assuming it's their media)
            if (isLoggedIn) {
                body.append(title, meta, uploader, delBtn);
            } else {
                body.append(title, meta, uploader);
            }

            card.append(img, body);
            grid.appendChild(card);
        });
    } catch (err) {
        console.error("Failed to load media:", err);
        grid.innerHTML = `<p class="col-span-full text-center py-12 text-red-600">
            Could not load media (${err.message})<br>Please try refreshing.
        </p>`;
    }
}
async function deleteMedia(id) {
  const token = localStorage.getItem('token');
  if (!token) return;

  try {
    const res = await fetch(`/media/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (res.ok) {
      alert('Deleted ✨');
      loadMedia();
    } else {
      alert('Delete failed');
    }
  } catch (err) {
    alert('Error: ' + err.message);
  }
}