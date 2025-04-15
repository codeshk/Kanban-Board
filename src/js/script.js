// Variáveis globais
let currentCard = null;
let currentColumn = null;
const teamMembers = [
  { name: "João Silva", avatar: "default.png" },
  { name: "Maria Souza", avatar: "default.png" },
  { name: "Carlos Oliveira", avatar: "default.png" },
  { name: "Ana Santos", avatar: "default.png" },
  { name: "Pedro Costa", avatar: "default.png" },
  { name: "Gabriel Shiki", avatar: "me.jpg" }
];

// Inicialização quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
  setupAutocomplete();
  initializeEventListeners();
  initializeDragAndDrop();
  addCardEventsToExistingCards();
});

// Configura o autocomplete para o campo de responsável
function setupAutocomplete() {
  const assigneeInput = document.getElementById('card-assignee-input');
  const avatarInput = document.getElementById('card-assignee');
  const nameInput = document.getElementById('card-assignee-name');
  const suggestionsContainer = document.querySelector('.autocomplete .suggestions');

  assigneeInput.addEventListener('input', function() {
    const inputText = this.value.toLowerCase();
    suggestionsContainer.innerHTML = '';
    
    if (inputText.length < 2) {
      suggestionsContainer.style.display = 'none';
      return;
    }

    const filteredMembers = teamMembers.filter(member => 
      member.name.toLowerCase().includes(inputText)
    );

    if (filteredMembers.length > 0) {
      filteredMembers.forEach(member => {
        const div = document.createElement('div');
        div.className = 'suggestion-item';
        div.innerHTML = `
          <img src="./src/images/${member.avatar}" alt="${member.name}">
          <span>${member.name}</span>
        `;
        div.addEventListener('click', () => {
          assigneeInput.value = member.name;
          nameInput.value = member.name;
          avatarInput.value = member.avatar;
          suggestionsContainer.style.display = 'none';
        });
        suggestionsContainer.appendChild(div);
      });
      suggestionsContainer.style.display = 'block';
    } else {
      suggestionsContainer.style.display = 'none';
    }
  });

  // Fechar sugestões ao clicar fora
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.autocomplete')) {
      suggestionsContainer.style.display = 'none';
    }
  });
}

// Configura os event listeners principais
function initializeEventListeners() {
  // Botões de adicionar card
  document.querySelectorAll('.add-card').forEach(button => {
    button.addEventListener('click', () => {
      const column = button.closest('.kanban-column');
      openCreateModal(column);
    });
  });

  // Formulário de card
  document.getElementById('card-form').addEventListener('submit', handleFormSubmit);

  // Botões do modal de visualização
  document.getElementById('edit-card-btn').addEventListener('click', handleEditCard);
  document.getElementById('delete-card-btn').addEventListener('click', handleDeleteCard);

  // Fechar modais
  document.querySelectorAll('.close-modal').forEach(btn => {
    btn.addEventListener('click', closeModals);
  });

  // Fechar modal ao clicar fora
  window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
      closeModals();
    }
  });
}

// Configura o drag and drop
function initializeDragAndDrop() {
  document.querySelectorAll('.kanban-cards').forEach(column => {
    column.addEventListener('dragover', e => {
      e.preventDefault();
      e.currentTarget.classList.add('cards-hover');
    });

    column.addEventListener('dragleave', e => {
      e.preventDefault();
      e.currentTarget.classList.remove('cards-hover');
    });

    column.addEventListener('drop', e => {
      e.preventDefault();
      e.currentTarget.classList.remove('cards-hover');
      const dragCard = document.querySelector('.kanban-card.dragging');
      if (dragCard) {
        e.currentTarget.appendChild(dragCard);
      }
    });
  });
}

// Adiciona eventos aos cards existentes
function addCardEventsToExistingCards() {
  document.querySelectorAll('.kanban-card').forEach(card => {
    addCardEvents(card);
  });
}

// Função para abrir modal de criação
function openCreateModal(column) {
  currentColumn = column;
  document.getElementById('modal-title').textContent = 'Novo Card';
  document.getElementById('card-form').reset();
  document.getElementById('card-assignee').value = 'default.png';
  document.getElementById('card-assignee-name').value = '';
  document.getElementById('card-modal').style.display = 'block';
}

// Função para abrir modal de visualização
function openViewModal(card) {
  currentCard = card;
  
  document.getElementById('view-card-name').textContent = card.querySelector('.card-title').textContent;
  
  const badge = card.querySelector('.badge');
  let priorityText = 'Alta';
  if (badge.classList.contains('medium')) priorityText = 'Média';
  if (badge.classList.contains('low')) priorityText = 'Baixa';
  document.getElementById('view-card-priority').textContent = priorityText + ' Prioridade';
  
  document.getElementById('view-card-description').textContent = card.dataset.description || 'Sem descrição';
  document.getElementById('view-card-assignee').textContent = card.dataset.assigneeName || 'Sem responsável';
  document.getElementById('view-card-due-date').textContent = card.dataset.dueDate || 'Sem data definida';
  
  document.getElementById('view-modal').style.display = 'block';
}

// Função para fechar modais
function closeModals() {
  document.getElementById('card-modal').style.display = 'none';
  document.getElementById('view-modal').style.display = 'none';
  currentCard = null;
  currentColumn = null;
}

// Manipulador do formulário
function handleFormSubmit(e) {
  e.preventDefault();
  
  const formData = {
    name: document.getElementById('card-name').value,
    description: document.getElementById('card-description').value,
    priority: document.getElementById('card-priority').value,
    assignee: document.getElementById('card-assignee').value,
    assigneeName: document.getElementById('card-assignee-input').value,
    dueDate: document.getElementById('card-due-date').value
  };
  
  if (!formData.name.trim()) {
    alert('Por favor, insira um nome para o card');
    return;
  }
  
  if (currentCard) {
    updateCard(currentCard, formData);
  } else {
    const newCard = createCard(formData);
    currentColumn.querySelector('.kanban-cards').appendChild(newCard);
  }
  
  closeModals();
}

// Cria um novo card
function createCard(data) {
  const card = document.createElement('div');
  card.className = 'kanban-card';
  card.draggable = true;
  
  card.dataset.description = data.description || '';
  card.dataset.assignee = data.assignee || 'default.png';
  card.dataset.assigneeName = data.assigneeName || '';
  card.dataset.dueDate = data.dueDate || '';
  
  let priorityText = 'Alta Prioridade';
  if (data.priority === 'medium') priorityText = 'Média Prioridade';
  if (data.priority === 'low') priorityText = 'Baixa Prioridade';
  
  // Usa a imagem específica ou default.png se não existir
  const avatarPath = teamMembers.some(m => m.avatar === data.assignee) 
    ? data.assignee 
    : 'default.png';

    card.innerHTML = `
    <div class="badge ${data.priority}">
      <span>${priorityText}</span>
    </div>
    <p class="card-title">${data.name}</p>
    <div class="card-infos">
      <div class="card-icons">
        <p><i class="fa-regular fa-comment"></i> 0</p>
        <p><i class="fa-solid fa-paperclip"></i> 0</p>
      </div>
      <div class="user">
        <img src="./src/images/${avatarPath}" alt="${data.assigneeName || 'Responsável'}">
      </div>
    </div>
  `;
  
  addCardEvents(card);
  return card;
}

// Atualiza um card existente
function updateCard(card, data) {
  const badge = card.querySelector('.badge');
  badge.className = 'badge ' + data.priority;
  
  let priorityText = 'Alta Prioridade';
  if (data.priority === 'medium') priorityText = 'Média Prioridade';
  if (data.priority === 'low') priorityText = 'Baixa Prioridade';
  badge.querySelector('span').textContent = priorityText;
  
  card.querySelector('.card-title').textContent = data.name;
  card.querySelector('.user img').src = './src/images/default.png';
  card.querySelector('.user img').alt = data.assigneeName || 'Responsável';
  
  card.dataset.description = data.description || '';
  card.dataset.assignee = data.assignee || 'default.png';
  card.dataset.assigneeName = data.assigneeName || '';
  card.dataset.dueDate = data.dueDate || '';
}

// Adiciona eventos a um card
function addCardEvents(card) {
  card.addEventListener('dragstart', e => {
    e.currentTarget.classList.add('dragging');
  });
  
  card.addEventListener('dragend', e => {
    e.currentTarget.classList.remove('dragging');
  });
  
  card.addEventListener('click', (e) => {
    if (!e.target.closest('.card-icons') && !e.target.closest('.user')) {
      openViewModal(card);
    }
  });
}

// Manipulador do botão Editar
function handleEditCard() {
  closeModals();
  
  document.getElementById('modal-title').textContent = 'Editar Card';
  document.getElementById('card-name').value = currentCard.querySelector('.card-title').textContent;
  document.getElementById('card-description').value = currentCard.dataset.description || '';
  
  const badge = currentCard.querySelector('.badge');
  if (badge.classList.contains('medium')) {
    document.getElementById('card-priority').value = 'medium';
  } else if (badge.classList.contains('low')) {
    document.getElementById('card-priority').value = 'low';
  } else {
    document.getElementById('card-priority').value = 'high';
  }
  
  document.getElementById('card-assignee-input').value = currentCard.dataset.assigneeName || '';
  document.getElementById('card-assignee').value = currentCard.dataset.assignee || 'default.png';
  document.getElementById('card-assignee-name').value = currentCard.dataset.assigneeName || '';
  document.getElementById('card-due-date').value = currentCard.dataset.dueDate || '';
  
  document.getElementById('card-modal').style.display = 'block';
}

// Manipulador do botão Excluir
function handleDeleteCard() {
  if (confirm('Tem certeza que deseja excluir este card?')) {
    currentCard.remove();
    closeModals();
  }
}
