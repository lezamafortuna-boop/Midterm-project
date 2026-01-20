document.addEventListener('DOMContentLoaded', () => {
  const messageBox = document.getElementById('message');
  const usersTableBody = document.getElementById('usersTableBody');
  const refreshBtn = document.getElementById('refreshBtn');
  
  const editDialog = document.getElementById('editDialog');
  const editForm = document.getElementById('editForm');
  const closeEditDialog = document.getElementById('closeEditDialog');
  const cancelEditBtn = document.getElementById('cancelEditBtn');
  const editMessage = document.getElementById('editMessage');
  
  const deleteDialog = document.getElementById('deleteDialog');
  const closeDeleteDialog = document.getElementById('closeDeleteDialog');
  const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
  const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
  const deleteMessage = document.getElementById('deleteMessage');
  const deleteUsername = document.getElementById('deleteUsername');
  
  let currentEditingUser = null;
  let currentDeletingUser = null;

  // Load users on page load
  loadUsers();

  refreshBtn.addEventListener('click', loadUsers);

  async function loadUsers() {
    try {
      const response = await fetch('/api/admin/users');
      if (!response.ok) {
        throw new Error('Failed to load users');
      }
      const users = await response.json();
      
      usersTableBody.innerHTML = '';
      users.forEach(user => {
        const row = document.createElement('tr');
        const adminEmail = localStorage.getItem('adminEmail') || ''; // Get admin email if available
        const isAdmin = user.email === adminEmail;
        row.innerHTML = `
          <td>${user.email}${isAdmin ? ' <strong style="color: var(--brand-color);">(Admin)</strong>' : ''}</td>
          <td class="actions-cell">
            ${!isAdmin ? `
              <button class="edit-user-btn" data-id="${user._id}" data-email="${user.email}" data-name="${user.name || ''}">Edit</button>
              <button class="delete-user-btn" data-id="${user._id}" data-email="${user.email}">Delete</button>
            ` : '<span style="color: var(--secondary-text-color);">Admin</span>'}
          </td>
        `;
        usersTableBody.appendChild(row);
      });

      // Add event listeners to edit and delete buttons
      document.querySelectorAll('.edit-user-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          currentEditingUser = {
            id: btn.dataset.id,
            email: btn.dataset.email,
            name: btn.dataset.name
          };
          document.getElementById('editUsername').value = btn.dataset.name || btn.dataset.email;
          editMessage.textContent = '';
          editDialog.showModal();
          document.getElementById('editUsername').focus();
        });
      });

      document.querySelectorAll('.delete-user-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          currentDeletingUser = {
            id: btn.dataset.id,
            email: btn.dataset.email
          };
          deleteUsername.textContent = btn.dataset.email;
          deleteMessage.textContent = '';
          deleteDialog.showModal();
        });
      });

      showMessage('Users loaded successfully', 'success');
    } catch (err) {
      console.error('Error loading users:', err);
      showMessage('Failed to load users', 'error');
    }
  }

  // Edit Dialog Events
  closeEditDialog.addEventListener('click', () => editDialog.close());
  cancelEditBtn.addEventListener('click', () => editDialog.close());

  editForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!currentEditingUser) return;

    const name = document.getElementById('editUsername').value;

    try {
      const response = await fetch(`/api/admin/users/${currentEditingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name
        })
      });

      const data = await response.json();

      if (!response.ok) {
        editMessage.textContent = data.error || 'Failed to update user';
        editMessage.className = 'message-box error';
        return;
      }

      editMessage.textContent = 'User updated successfully!';
      editMessage.className = 'message-box success';
      
      setTimeout(() => {
        editDialog.close();
        loadUsers();
      }, 1500);
    } catch (err) {
      console.error('Error updating user:', err);
      editMessage.textContent = 'An error occurred';
      editMessage.className = 'message-box error';
    }
  });

  // Delete Dialog Events
  closeDeleteDialog.addEventListener('click', () => deleteDialog.close());
  cancelDeleteBtn.addEventListener('click', () => deleteDialog.close());

  confirmDeleteBtn.addEventListener('click', async () => {
    if (!currentDeletingUser) return;

    try {
      const response = await fetch(`/api/admin/users/${currentDeletingUser.id}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (!response.ok) {
        deleteMessage.textContent = data.error || 'Failed to delete user';
        deleteMessage.className = 'message-box error';
        return;
      }

      deleteMessage.textContent = 'User deleted successfully!';
      deleteMessage.className = 'message-box success';
      
      setTimeout(() => {
        deleteDialog.close();
        loadUsers();
      }, 1500);
    } catch (err) {
      console.error('Error deleting user:', err);
      deleteMessage.textContent = 'An error occurred';
      deleteMessage.className = 'message-box error';
    }
  });

  function showMessage(text, type) {
    messageBox.textContent = text;
    messageBox.className = `message-box ${type}`;
    if (type === 'success') {
      setTimeout(() => {
        messageBox.textContent = '';
      }, 3000);
    }
  }
});
