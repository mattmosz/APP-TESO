export function createModal(title, content) {
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h2 class="modal-title">${title}</h2>
        <button class="modal-close" id="modal-close">&times;</button>
      </div>
      <div class="modal-body">
        ${content}
      </div>
    </div>
  `;

  modal.addEventListener('click', (e) => {
    if (e.target === modal || e.target.id === 'modal-close') {
      closeModal(modal);
    }
  });

  return modal;
}

export function openModal(modal) {
  document.body.appendChild(modal);
  setTimeout(() => modal.classList.add('active'), 10);
}

export function closeModal(modal) {
  modal.classList.remove('active');
  setTimeout(() => modal.remove(), 200);
}
