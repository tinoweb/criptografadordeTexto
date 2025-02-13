// Estado global
let currentPage = 1;
let currentFilters = {
    search: '',
    type: '',
    favorite: false,
    sort: 'newest'
};

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    // Verificar autenticação primeiro
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/auth.html';
        return;
    }

    loadHistory();
    setupEventListeners();
});

// Configurar listeners de eventos
function setupEventListeners() {
    // Busca
    const searchInput = document.getElementById('searchInput');
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            currentFilters.search = e.target.value;
            currentPage = 1;
            loadHistory();
        }, 300);
    });

    // Filtros
    document.getElementById('typeFilter').addEventListener('change', (e) => {
        currentFilters.type = e.target.value;
        currentPage = 1;
        loadHistory();
    });

    document.getElementById('sortFilter').addEventListener('change', (e) => {
        currentFilters.sort = e.target.value;
        currentPage = 1;
        loadHistory();
    });

    document.getElementById('favoriteFilter').addEventListener('click', (e) => {
        const btn = e.currentTarget;
        btn.classList.toggle('active');
        currentFilters.favorite = btn.classList.contains('active');
        currentPage = 1;
        loadHistory();
    });
}

// Carregar histórico
async function loadHistory() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = '/auth.html';
            return;
        }

        showLoading();

        const queryParams = new URLSearchParams({
            page: currentPage,
            limit: 10,
            ...(currentFilters.search && { search: currentFilters.search }),
            ...(currentFilters.type && { type: currentFilters.type }),
            ...(currentFilters.favorite && { favorite: true }),
            sort: currentFilters.sort
        });

        // Log para debug
        console.log('Fazendo requisição para:', `/api/v1/history?${queryParams}`);
        console.log('Token:', token);

        const response = await fetch(`/api/v1/history?${queryParams}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        // Log para debug
        console.log('Status da resposta:', response.status);
        const responseText = await response.text();
        console.log('Resposta do servidor:', responseText);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Converter texto para JSON
        const data = JSON.parse(responseText);
        
        if (!data.success) {
            throw new Error(data.error || 'Erro ao carregar histórico');
        }

        renderHistory(data.data);
        renderPagination(data.pagination);
    } catch (error) {
        console.error('Erro ao carregar histórico:', error);
        showError('Erro ao carregar histórico. Por favor, tente novamente.');
    } finally {
        hideLoading();
    }
}

// Renderizar itens do histórico
function renderHistory(items) {
    const historyList = document.getElementById('historyList');
    
    if (!items || items.length === 0) {
        historyList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-history"></i>
                <p>Nenhum registro encontrado</p>
                <small>Seus textos criptografados aparecerão aqui</small>
            </div>
        `;
        return;
    }

    historyList.innerHTML = items.map(item => `
        <div class="history-item" data-id="${item._id}">
            <div class="item-header">
                <div class="item-type ${item.encryptionType}">
                    ${getTypeIcon(item.encryptionType)}
                    <span>${getTypeName(item.encryptionType)}</span>
                </div>
                <div class="item-actions">
                    <button class="action-btn ${item.isFavorite ? 'active' : ''}" onclick="toggleFavorite('${item._id}')">
                        <i class="fas fa-star"></i>
                    </button>
                    <button class="action-btn" onclick="showDetails('${item._id}')">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn delete" onclick="deleteEntry('${item._id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            
            <div class="item-content">
                <div class="text-preview">
                    <strong>Original:</strong> ${item.originalText.substring(0, 50)}${item.originalText.length > 50 ? '...' : ''}
                </div>
                <div class="text-preview">
                    <strong>Criptografado:</strong> ${item.encryptedText.substring(0, 50)}${item.encryptedText.length > 50 ? '...' : ''}
                </div>
            </div>
            
            <div class="item-footer">
                <div class="item-date">
                    <i class="far fa-clock"></i>
                    ${formatDate(item.createdAt)}
                </div>
                ${renderTags(item.tags)}
            </div>
        </div>
    `).join('');
}

// Renderizar paginação
function renderPagination({ page, pages, total }) {
    const pagination = document.getElementById('pagination');
    
    if (pages <= 1) {
        pagination.innerHTML = '';
        return;
    }

    let buttons = [];
    
    // Primeira página
    buttons.push(`
        <button class="page-btn ${page === 1 ? 'active' : ''}" 
                onclick="changePage(1)">1</button>
    `);

    // Páginas do meio
    if (pages > 5) {
        if (page > 3) {
            buttons.push('<span class="page-ellipsis">...</span>');
        }

        for (let i = Math.max(2, page - 1); i <= Math.min(pages - 1, page + 1); i++) {
            buttons.push(`
                <button class="page-btn ${page === i ? 'active' : ''}" 
                        onclick="changePage(${i})">${i}</button>
            `);
        }

        if (page < pages - 2) {
            buttons.push('<span class="page-ellipsis">...</span>');
        }
    } else {
        for (let i = 2; i < pages; i++) {
            buttons.push(`
                <button class="page-btn ${page === i ? 'active' : ''}" 
                        onclick="changePage(${i})">${i}</button>
            `);
        }
    }

    // Última página
    if (pages > 1) {
        buttons.push(`
            <button class="page-btn ${page === pages ? 'active' : ''}" 
                    onclick="changePage(${pages})">${pages}</button>
        `);
    }

    pagination.innerHTML = buttons.join('');
}

// Funções auxiliares
function getTypeIcon(type) {
    const icons = {
        email: 'envelope',
        sms: 'comment',
        custom: 'key'
    };
    return icons[type] || 'question';
}

function getTypeName(type) {
    const names = {
        email: 'E-mail',
        sms: 'SMS',
        custom: 'Personalizado'
    };
    return names[type] || 'Desconhecido';
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function renderTags(tags) {
    if (!tags || tags.length === 0) return '';
    return tags.map(tag => `
        <span class="tag">${tag}</span>
    `).join('');
}

function showLoading() {
    const historyList = document.getElementById('historyList');
    historyList.innerHTML = `
        <div class="loading">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Carregando histórico...</p>
        </div>
    `;
}

function hideLoading() {
    // O loading será substituído pelo conteúdo quando o histórico for carregado
}

function showError(message) {
    const historyList = document.getElementById('historyList');
    historyList.innerHTML = `
        <div class="error-state">
            <i class="fas fa-exclamation-circle"></i>
            <p>${message}</p>
            <button onclick="loadHistory()" class="retry-btn">
                <i class="fas fa-redo"></i>
                Tentar novamente
            </button>
        </div>
    `;
}

// Ações do usuário
async function toggleFavorite(id) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/v1/history/${id}/favorite`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();
        if (data.success) {
            loadHistory();
        }
    } catch (error) {
        console.error('Erro ao marcar favorito:', error);
    }
}

async function deleteEntry(id) {
    if (!confirm('Tem certeza que deseja excluir este item?')) {
        return;
    }

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/v1/history/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();
        if (data.success) {
            loadHistory();
        }
    } catch (error) {
        console.error('Erro ao excluir item:', error);
    }
}

async function showDetails(id) {
    try {
        showLoading();
        const response = await fetch(`/api/v1/history/${id}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) {
            throw new Error('Erro ao carregar detalhes');
        }

        const { data } = await response.json();
        
        // Preencher os campos do modal com os dados
        document.getElementById('originalText').value = data.originalText || '';
        document.getElementById('encryptedText').value = data.encryptedText || '';
        document.getElementById('encryptionType').textContent = getTypeName(data.encryptionType);
        document.getElementById('createdAt').textContent = formatDate(data.createdAt);
        
        if (data.tags && data.tags.length > 0) {
            document.getElementById('tags').innerHTML = renderTags(data.tags);
        } else {
            document.getElementById('tags').innerHTML = '<span class="no-tags">Sem tags</span>';
        }

        // Exibir o modal
        const modal = document.getElementById('detailsModal');
        modal.classList.add('active');
    } catch (error) {
        showError('Erro ao carregar detalhes do histórico');
        console.error('Erro:', error);
    } finally {
        hideLoading();
    }
}

function closeModal() {
    const modal = document.getElementById('detailsModal');
    modal.classList.remove('active');
}

function changePage(page) {
    currentPage = page;
    loadHistory();
}

// Funções de cópia
function copyText(elementId) {
    const element = document.getElementById(elementId);
    const text = element.textContent;
    
    navigator.clipboard.writeText(text).then(() => {
        // Mostrar feedback visual
        const button = element.nextElementSibling;
        const originalText = button.innerHTML;
        button.innerHTML = '<i class="fas fa-check"></i> Copiado!';
        setTimeout(() => {
            button.innerHTML = originalText;
        }, 2000);
    }).catch(err => {
        console.error('Erro ao copiar texto:', err);
    });
}
