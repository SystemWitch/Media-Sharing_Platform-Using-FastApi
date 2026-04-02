document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  const loggedIn = !!token;

  document.getElementById('media-nav')?.classList.toggle('hidden', !loggedIn);
  document.getElementById('logout-nav')?.classList.toggle('hidden', !loggedIn);
  document.getElementById('login-nav')?.classList.toggle('hidden', loggedIn);
  document.getElementById('register-nav')?.classList.toggle('hidden', loggedIn);
  document.getElementById('upload-nav')?.classList.remove('hidden');

  document.getElementById('logout-btn')?.addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  });
});