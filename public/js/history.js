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

    // Adicionar listener para fechar modal com ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal();
        }
    });

    // Adicionar listener para fechar modal clicando fora
    const modal = document.getElementById('detailsModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModal();
            }
        });
    }
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
            sort: currentFilters.sort === 'newest' ? 'desc' : 'asc'
        });

        const response = await fetch(`/api/v1/history?${queryParams}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Erro ao carregar histórico');
        }

        const data = await response.json();
        
        if (data.status === 'success') {
            renderHistory(data.data.history);
            renderPagination(data.data.pagination);
        } else {
            throw new Error(data.message || 'Erro ao carregar histórico');
        }
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
                <div class="item-text">
                    <p class="original-text">${item.originalText.substring(0, 100)}${item.originalText.length > 100 ? '...' : ''}</p>
                    <p class="encrypted-text">${item.encryptedText.substring(0, 100)}${item.encryptedText.length > 100 ? '...' : ''}</p>
                </div>
                <div class="item-meta">
                    <span class="date">
                        <i class="far fa-clock"></i>
                        ${formatDate(item.createdAt)}
                    </span>
                    ${item.tags && item.tags.length > 0 ? `
                        <div class="tags">
                            ${renderTags(item.tags)}
                        </div>
                    ` : ''}
                </div>
            </div>
        </div>
    `).join('');
}

// Renderizar paginação
function renderPagination({ page, pages, total }) {
    const paginationEl = document.getElementById('pagination');
    if (!paginationEl) return;

    if (total === 0) {
        paginationEl.innerHTML = '';
        return;
    }

    let html = '<div class="pagination">';

    // Botão anterior
    if (page > 1) {
        html += `<button onclick="changePage(${page - 1})" class="page-btn">
            <i class="fas fa-chevron-left"></i>
        </button>`;
    }

    // Páginas
    for (let i = 1; i <= pages; i++) {
        if (
            i === 1 || // Primeira página
            i === pages || // Última página
            (i >= page - 2 && i <= page + 2) // 2 páginas antes e depois da atual
        ) {
            html += `<button onclick="changePage(${i})" class="page-btn ${i === page ? 'active' : ''}">${i}</button>`;
        } else if (
            (i === page - 3 && page > 4) || // Reticências antes
            (i === page + 3 && page < pages - 3) // Reticências depois
        ) {
            html += '<span class="page-dots">...</span>';
        }
    }

    // Botão próximo
    if (page < pages) {
        html += `<button onclick="changePage(${page + 1})" class="page-btn">
            <i class="fas fa-chevron-right"></i>
        </button>`;
    }

    html += '</div>';
    paginationEl.innerHTML = html;
}

// Funções auxiliares
function getTypeIcon(type) {
    const icons = {
        email: 'fa-envelope',
        sms: 'fa-comment-alt',
        anuncios: 'fa-ad'
    };
    return `<i class="fas ${icons[type] || 'fa-lock'}"></i>`;
}

function getTypeName(type) {
    const names = {
        email: 'E-mail',
        sms: 'SMS',
        anuncios: 'Anúncios'
    };
    return names[type] || type;
}

function formatDate(dateString) {
    try {
        if (!dateString) return 'Data não disponível';
        
        // Se for um timestamp numérico
        if (typeof dateString === 'number') {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'Data inválida';
            return new Intl.DateTimeFormat('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }).format(date);
        }
        
        // Se for uma string ISO ou outra formato
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Data inválida';
        
        return new Intl.DateTimeFormat('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    } catch (error) {
        console.error('Erro ao formatar data:', error);
        return 'Data inválida';
    }
}

function renderTags(tags) {
    return tags.map(tag => `
        <span class="tag">${tag}</span>
    `).join('');
}

function showLoading() {
    const loadingEl = document.getElementById('loading');
    if (loadingEl) {
        loadingEl.classList.add('show');
    }
}

function hideLoading() {
    const loadingEl = document.getElementById('loading');
    if (loadingEl) {
        loadingEl.classList.remove('show');
    }
}

function showError(message) {
    const errorEl = document.createElement('div');
    errorEl.className = 'error-message';
    errorEl.innerHTML = `
        <i class="fas fa-exclamation-circle"></i>
        <span>${message}</span>
    `;
    document.body.appendChild(errorEl);
    setTimeout(() => {
        errorEl.remove();
    }, 5000);
}

// Ações do usuário
async function toggleFavorite(id) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/v1/history/${id}/favorite`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Erro ao atualizar favorito');
        }

        loadHistory(); // Recarregar lista
    } catch (error) {
        console.error('Erro ao atualizar favorito:', error);
        showError('Erro ao atualizar favorito');
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

        if (!response.ok) {
            throw new Error('Erro ao excluir item');
        }

        loadHistory(); // Recarregar lista
    } catch (error) {
        console.error('Erro ao excluir item:', error);
        showError('Erro ao excluir item');
    }
}

async function showDetails(id) {
    console.log('Abrindo detalhes para ID:', id);
    
    fetch(`/api/v1/history/${id}`, {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Accept': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        console.log('Dados recebidos:', data);
        
        if (!data.data) throw new Error('Dados não encontrados');
        
        const item = data.data;
        
        // Preencher dados
        document.getElementById('originalText').value = item.originalText || '';
        document.getElementById('encryptedText').value = item.encryptedText || '';
        document.getElementById('encryptionType').textContent = getTypeName(item.encryptionType);
        document.getElementById('createdAt').textContent = formatDate(item.createdAt);
        
        // Tags
        const tagsEl = document.getElementById('tags');
        tagsEl.innerHTML = item.tags?.length 
            ? item.tags.map(tag => `<span style="padding: 4px 8px; background: #2a2a2a; border: 1px solid #333; border-radius: 4px; color: #888;">${tag}</span>`).join('')
            : '<span style="color: #666; font-style: italic;">Sem tags</span>';
        
        // Mostrar modal
        document.getElementById('detailsModal').style.display = 'block';
    })
    .catch(error => {
        console.error('Erro:', error);
        alert('Erro ao carregar detalhes');
    });
}

function closeModal() {
    document.getElementById('detailsModal').style.display = 'none';
}

function copyText(elementId) {
    const el = document.getElementById(elementId);
    const text = el.value;
    
    navigator.clipboard.writeText(text)
        .then(() => {
            const btn = el.nextElementSibling;
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-check"></i> Copiado!';
            setTimeout(() => btn.innerHTML = originalText, 2000);
        })
        .catch(() => alert('Erro ao copiar texto'));
}

function changePage(page) {
    currentPage = page;
    loadHistory();
}

// Tornar funções disponíveis globalmente
window.showDetails = showDetails;
window.closeModal = closeModal;
window.copyText = copyText;
window.toggleFavorite = toggleFavorite;
window.deleteEntry = deleteEntry;
window.changePage = changePage;
