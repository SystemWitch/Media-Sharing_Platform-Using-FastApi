document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('login-form')?.addEventListener('submit', async e => {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    try {
      const res = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData
      });

      if (res.ok) {
        const { access_token } = await res.json();
        localStorage.setItem('token', access_token);
        window.location.href = '/media';
      } else {
        const err = await res.json();
        alert(err.detail || 'Login failed');
      }
    } catch (err) {
      alert('Network error – please try again');
    }
  });
});