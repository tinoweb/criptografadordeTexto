// Elementos do DOM
const keysList = document.getElementById('keysList');
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');
const showFavorites = document.getElementById('showFavorites');
const addKeyBtn = document.getElementById('addKeyBtn');
const keyModal = document.getElementById('keyModal');
const keyForm = document.getElementById('keyForm');
const modalTitle = document.getElementById('modalTitle');

let currentKeys = [];
let editingKeyId = null;

// Event Listeners
document.addEventListener('DOMContentLoaded', loadKeys);
searchInput.addEventListener('input', filterKeys);
categoryFilter.addEventListener('change', filterKeys);
showFavorites.addEventListener('click', toggleFavoriteFilter);
addKeyBtn.addEventListener('click', () => openModal());
keyForm.addEventListener('submit', handleKeySubmit);

document.querySelectorAll('.close-btn, [data-dismiss="modal"]').forEach(element => {
    element.addEventListener('click', closeModal);
});

// Funções principais
async function loadKeys() {
    try {
        const response = await fetch('/api/v1/keys');
        const data = await response.json();
        
        if (data.success) {
            currentKeys = data.data;
            renderKeys(currentKeys);
        }
    } catch (error) {
        console.error('Erro ao carregar chaves:', error);
        showToast('Erro ao carregar chaves', 'error');
    }
}

function renderKeys(keys) {
    keysList.innerHTML = '';
    
    if (keys.length === 0) {
        keysList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-key"></i>
                <p>Nenhuma chave encontrada</p>
            </div>
        `;
        return;
    }
    
    keys.forEach(key => {
        const keyCard = document.createElement('div');
        keyCard.className = 'key-card';
        keyCard.innerHTML = `
            <div class="key-header">
                <h3 class="key-title">${escapeHtml(key.name)}</h3>
                <div class="key-actions">
                    <button class="key-action-btn favorite ${key.isFavorite ? 'active' : ''}" onclick="toggleFavorite('${key._id}')">
                        <i class="fa${key.isFavorite ? 's' : 'r'} fa-star"></i>
                    </button>
                    <button class="key-action-btn" onclick="editKey('${key._id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="key-action-btn" onclick="deleteKey('${key._id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="key-value">${escapeHtml(key.key)}</div>
            ${key.description ? `<div class="key-info">${escapeHtml(key.description)}</div>` : ''}
            <div class="key-meta">
                <span class="key-category">${escapeHtml(key.category)}</span>
                <span class="key-date">Criada em ${new Date(key.createdAt).toLocaleDateString()}</span>
            </div>
        `;
        keysList.appendChild(keyCard);
    });
}

function filterKeys() {
    const searchTerm = searchInput.value.toLowerCase();
    const category = categoryFilter.value;
    const showingFavorites = showFavorites.classList.contains('active');
    
    let filtered = currentKeys;
    
    if (searchTerm) {
        filtered = filtered.filter(key => 
            key.name.toLowerCase().includes(searchTerm) ||
            key.description?.toLowerCase().includes(searchTerm) ||
            key.category.toLowerCase().includes(searchTerm)
        );
    }
    
    if (category) {
        filtered = filtered.filter(key => key.category === category);
    }
    
    if (showingFavorites) {
        filtered = filtered.filter(key => key.isFavorite);
    }
    
    renderKeys(filtered);
}

function toggleFavoriteFilter() {
    showFavorites.classList.toggle('active');
    filterKeys();
}

async function toggleFavorite(keyId) {
    try {
        const response = await fetch(`/api/v1/keys/${keyId}/favorite`, {
            method: 'PATCH'
        });
        
        const data = await response.json();
        
        if (data.success) {
            const keyIndex = currentKeys.findIndex(k => k._id === keyId);
            currentKeys[keyIndex] = data.data;
            filterKeys();
        }
    } catch (error) {
        console.error('Erro ao alternar favorito:', error);
        showToast('Erro ao alternar favorito', 'error');
    }
}

function openModal(keyId = null) {
    editingKeyId = keyId;
    modalTitle.textContent = keyId ? 'Editar Chave' : 'Nova Chave';
    
    if (keyId) {
        const key = currentKeys.find(k => k._id === keyId);
        if (key) {
            document.getElementById('keyName').value = key.name;
            document.getElementById('keyValue').value = key.key;
            document.getElementById('keyDescription').value = key.description || '';
            document.getElementById('keyCategory').value = key.category;
        }
    } else {
        keyForm.reset();
    }
    
    keyModal.style.display = 'block';
}

function closeModal() {
    keyModal.style.display = 'none';
    keyForm.reset();
    editingKeyId = null;
}

async function handleKeySubmit(e) {
    e.preventDefault();
    
    const keyData = {
        name: document.getElementById('keyName').value,
        key: document.getElementById('keyValue').value,
        description: document.getElementById('keyDescription').value,
        category: document.getElementById('keyCategory').value
    };
    
    try {
        const url = editingKeyId 
            ? `/api/v1/keys/${editingKeyId}`
            : '/api/v1/keys';
            
        const method = editingKeyId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(keyData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            if (editingKeyId) {
                const keyIndex = currentKeys.findIndex(k => k._id === editingKeyId);
                currentKeys[keyIndex] = data.data;
            } else {
                currentKeys.unshift(data.data);
            }
            
            filterKeys();
            closeModal();
            showToast('Chave salva com sucesso', 'success');
        }
    } catch (error) {
        console.error('Erro ao salvar chave:', error);
        showToast('Erro ao salvar chave', 'error');
    }
}

async function deleteKey(keyId) {
    if (!confirm('Tem certeza que deseja excluir esta chave?')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/v1/keys/${keyId}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.success) {
            currentKeys = currentKeys.filter(k => k._id !== keyId);
            filterKeys();
            showToast('Chave excluída com sucesso', 'success');
        }
    } catch (error) {
        console.error('Erro ao excluir chave:', error);
        showToast('Erro ao excluir chave', 'error');
    }
}

function showToast(message, type = 'info') {
    // Implementar sistema de notificações toast
    alert(message);
}

function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
