document.addEventListener('DOMContentLoaded', () => {
  const msg = document.getElementById('message');
  const params = new URLSearchParams(window.location.search);
  if (params.has('error')) {
    const e = params.get('error');
    msg.textContent = e === 'exists' ? 'Username already exists.' : 'Login failed.';
    msg.style.color = 'crimson';
  } else if (params.has('registered')) {
    msg.textContent = 'Registration successful — you can now log in.';
    msg.style.color = 'green';
  }

  // simple enhancement: focus username
  const username = document.getElementById('username');
  if (username) username.focus();
});
