// Variáveis globais
let currentCard = null;
let currentColumn = null;

// Função para abrir modal de criação
function openCreateModal(column) {
  currentColumn = column;
  document.getElementById('modal-title').textContent = 'Novo Card';
  document.getElementById('card-form').reset();
  document.getElementById('card-modal').style.display = 'block';
}

// Função para abrir modal de visualização/edição
function openViewModal(card) {
  currentCard = card;
  
  // Preenche os dados do card no modal
  document.getElementById('view-card-name').textContent = card.querySelector('.card-title').textContent;
  
  // Extrai a prioridade da classe do badge
  const badge = card.querySelector('.badge');
  let priorityText = 'Alta';
  if (badge.classList.contains('medium')) priorityText = 'Média';
  if (badge.classList.contains('low')) priorityText = 'Baixa';
  document.getElementById('view-card-priority').textContent = priorityText + ' Prioridade';
  
  // Extrai dados adicionais armazenados no dataset do card
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

// Função para criar um novo card
function createCard(data) {
  const card = document.createElement('div');
  card.className = 'kanban-card';
  card.draggable = true;
  
  // Armazena todos os dados no dataset do card
  card.dataset.description = data.description || '';
  card.dataset.assignee = data.assignee || 'default.png';
  
  // Obtém o nome do responsável a partir do select
  const assigneeSelect = document.getElementById('card-assignee');
  const selectedOption = assigneeSelect.options[assigneeSelect.selectedIndex];
  card.dataset.assigneeName = selectedOption.text;
  
  card.dataset.dueDate = data.dueDate || '';
  
  // Determina o texto da prioridade
  let priorityText = 'Alta Prioridade';
  if (data.priority === 'medium') priorityText = 'Média Prioridade';
  if (data.priority === 'low') priorityText = 'Baixa Prioridade';
  
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
        <img src="./src/images/${data.assignee || 'default.png'}" alt="avatar">
      </div>
    </div>
  `;
  
  // Adiciona eventos
  addCardEvents(card);
  return card;
}

// Função para atualizar um card existente
function updateCard(card, data) {
  // Atualiza a prioridade
  const badge = card.querySelector('.badge');
  badge.className = 'badge ' + data.priority;
  
  // Atualiza o texto da prioridade
  let priorityText = 'Alta Prioridade';
  if (data.priority === 'medium') priorityText = 'Média Prioridade';
  if (data.priority === 'low') priorityText = 'Baixa Prioridade';
  badge.querySelector('span').textContent = priorityText;
  
  // Atualiza o título
  card.querySelector('.card-title').textContent = data.name;
  
  // Atualiza a imagem do responsável
  card.querySelector('.user img').src = `./src/images/${data.assignee || 'default.png'}`;
  
  // Atualiza os dados no dataset
  card.dataset.description = data.description || '';
  card.dataset.assignee = data.assignee || 'default.png';
  
  const assigneeSelect = document.getElementById('card-assignee');
  const selectedOption = assigneeSelect.options[assigneeSelect.selectedIndex];
  card.dataset.assigneeName = selectedOption.text;
  
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
    // Só abre o modal se não foi clique em um ícone ou na imagem do usuário
    if (!e.target.closest('.card-icons') && !e.target.closest('.user')) {
      openViewModal(card);
    }
  });
}

// Eventos dos botões de adicionar card
document.querySelectorAll('.add-card').forEach(button => {
  button.addEventListener('click', () => {
    const column = button.closest('.kanban-column');
    openCreateModal(column);
  });
});

// Evento de submit do formulário
document.getElementById('card-form').addEventListener('submit', (e) => {
  e.preventDefault();
  
  // Obter os valores do formulário
  const formData = {
    name: document.getElementById('card-name').value,
    description: document.getElementById('card-description').value,
    priority: document.getElementById('card-priority').value,
    assignee: document.getElementById('card-assignee').value,
    dueDate: document.getElementById('card-due-date').value
  };
  
  // Validação básica
  if (!formData.name.trim()) {
    alert('Por favor, insira um nome para o card');
    return;
  }
  
  if (currentCard) {
    // Editar card existente
    updateCard(currentCard, formData);
  } else {
    // Criar novo card
    const newCard = createCard(formData);
    currentColumn.querySelector('.kanban-cards').appendChild(newCard);
  }
  
  closeModals();
});

// Evento do botão Editar
document.getElementById('edit-card-btn').addEventListener('click', () => {
  closeModals();
  
  // Preenche o formulário de edição com os dados do card
  document.getElementById('modal-title').textContent = 'Editar Card';
  document.getElementById('card-name').value = currentCard.querySelector('.card-title').textContent;
  document.getElementById('card-description').value = currentCard.dataset.description || '';
  
  // Define a prioridade correta
  const badge = currentCard.querySelector('.badge');
  if (badge.classList.contains('medium')) {
    document.getElementById('card-priority').value = 'medium';
  } else if (badge.classList.contains('low')) {
    document.getElementById('card-priority').value = 'low';
  } else {
    document.getElementById('card-priority').value = 'high';
  }
  
  document.getElementById('card-assignee').value = currentCard.dataset.assignee || 'default.png';
  document.getElementById('card-due-date').value = currentCard.dataset.dueDate || '';
  
  // Abre o modal de edição
  document.getElementById('card-modal').style.display = 'block';
});

// Evento do botão Excluir
document.getElementById('delete-card-btn').addEventListener('click', () => {
  if (confirm('Tem certeza que deseja excluir este card?')) {
    currentCard.remove();
    closeModals();
  }
});

// Eventos para fechar os modais
document.querySelectorAll('.close-modal').forEach(btn => {
  btn.addEventListener('click', closeModals);
});

// Fecha o modal quando clicar fora dele
window.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal')) {
    closeModals();
  }
});

// Inicializa os eventos de drag and drop nos cards existentes
document.querySelectorAll('.kanban-card').forEach(card => {
  addCardEvents(card);
});

// Eventos de drag and drop nas colunas
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