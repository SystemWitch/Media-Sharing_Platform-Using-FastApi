document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('register-form')?.addEventListener('submit', async e => {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    try {
      const res = await fetch('/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (res.ok) {
        alert('Account created! Please sign in.');
        window.location.href = '/login';
      } else {
        const err = await res.json();
        alert(err.detail || 'Registration failed');
      }
    } catch (err) {
      alert('Network error – please try again');
    }
  });
});