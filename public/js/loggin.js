document.addEventListener('DOMContentLoaded', () => {
  const userSelectionScreen = document.getElementById('userSelectionScreen');
  const passwordScreen = document.getElementById('passwordScreen');
  const registrationScreen = document.getElementById('registrationScreen');
  
  const userButtons = document.getElementById('userButtons');
  const registerBtn = document.getElementById('registerBtn');
  const backBtn = document.getElementById('backBtn');
  const registrationBackBtn = document.getElementById('registrationBackBtn');
  
  const authForm = document.getElementById('authForm');
  const registrationForm = document.getElementById('registrationForm');
  const message = document.getElementById('message');
  const passwordMessage = document.getElementById('passwordMessage');
  const registrationMessage = document.getElementById('registrationMessage');
  const selectedUsername = document.getElementById('selectedUsername');
  
  let currentSelectedUser = null;

  // Load and display users on page load
  loadUsers();

  async function loadUsers() {
    try {
      const response = await fetch('/auth/users');
      const users = await response.json();
      
      userButtons.innerHTML = '';
      users.forEach(user => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'user-btn';
        btn.textContent = user.username;
        btn.onclick = () => selectUser(user.username);
        userButtons.appendChild(btn);
      });

      // Check for error messages from redirect
      const params = new URLSearchParams(window.location.search);
      if (params.has('error')) {
        const e = params.get('error');
        message.textContent = e === 'exists' ? 'Username already exists.' : 'Login failed.';
        message.className = 'error';
      } else if (params.has('registered')) {
        message.textContent = 'Registration successful!';
        message.className = 'success';
        loadUsers(); // Reload users after registration
      } else if (params.has('loginError')) {
        passwordMessage.textContent = 'Invalid password.';
        passwordMessage.className = 'error';
      }
    } catch (err) {
      console.error('Error loading users:', err);
      message.textContent = 'Failed to load users.';
      message.className = 'error';
    }
  }

  function selectUser(username) {
    currentSelectedUser = username;
    selectedUsername.textContent = username;
    userSelectionScreen.style.display = 'none';
    passwordScreen.style.display = 'block';
    document.getElementById('password').focus();
  }

  backBtn.addEventListener('click', (e) => {
    e.preventDefault();
    passwordScreen.style.display = 'none';
    userSelectionScreen.style.display = 'block';
    currentSelectedUser = null;
    document.getElementById('password').value = '';
    passwordMessage.textContent = '';
  });

  registerBtn.addEventListener('click', (e) => {
    e.preventDefault();
    userSelectionScreen.style.display = 'none';
    registrationScreen.style.display = 'block';
    document.getElementById('newUsername').focus();
  });

  registrationBackBtn.addEventListener('click', (e) => {
    e.preventDefault();
    registrationScreen.style.display = 'none';
    userSelectionScreen.style.display = 'block';
    document.getElementById('newUsername').value = '';
    document.getElementById('newPassword').value = '';
    registrationMessage.textContent = '';
  });

  authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const password = document.getElementById('password').value;

    try {
      const response = await fetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `username=${encodeURIComponent(currentSelectedUser)}&password=${encodeURIComponent(password)}`
      });

      if (response.redirected) {
        window.location.href = response.url;
      } else if (response.status === 401) {
        passwordMessage.textContent = 'Invalid password.';
        passwordMessage.className = 'error';
        document.getElementById('password').value = '';
      } else {
        passwordMessage.textContent = 'Login failed.';
        passwordMessage.className = 'error';
      }
    } catch (err) {
      console.error('Login error:', err);
      passwordMessage.textContent = 'An error occurred.';
      passwordMessage.className = 'error';
    }
  });

  registrationForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('newUsername').value;
    const password = document.getElementById('newPassword').value;

    try {
      const response = await fetch('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`
      });

      const data = await response.json();
      
      if (response.ok) {
        registrationMessage.textContent = 'Registration successful!';
        registrationMessage.className = 'success';
        document.getElementById('newUsername').value = '';
        document.getElementById('newPassword').value = '';
        setTimeout(() => {
          registrationScreen.style.display = 'none';
          userSelectionScreen.style.display = 'block';
          loadUsers();
          registrationMessage.textContent = '';
        }, 1500);
      } else {
        registrationMessage.textContent = data.error || 'Registration failed.';
        registrationMessage.className = 'error';
      }
    } catch (err) {
      console.error('Registration error:', err);
      registrationMessage.textContent = 'An error occurred.';
      registrationMessage.className = 'error';
    }
  });
});
