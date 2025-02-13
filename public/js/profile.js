// Carregar informações do usuário
async function loadUserProfile() {
    try {
        const response = await fetch('/api/v1/auth/me', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) {
            throw new Error('Falha ao carregar informações do usuário');
        }

        const data = await response.json();
        console.log('Dados do usuário:', data);

        if (data.status === 'success') {
            const user = data.data;
            
            // Atualizar informações pessoais
            document.getElementById('userName').value = user.name;
            document.getElementById('userEmail').value = user.email;

            // Atualizar informações do plano
            const planBadge = document.querySelector('.plan-badge');
            if (planBadge) {
                const planName = planBadge.querySelector('.plan-name');
                const planStatus = planBadge.querySelector('.plan-status');
                
                planName.textContent = user.subscriptionPlan.toUpperCase();
                planStatus.textContent = user.subscriptionStatus === 'active' ? 'Ativo' : 'Inativo';
                
                // Adicionar classe específica do plano
                planBadge.className = `plan-badge plan-${user.subscriptionPlan}`;
            }

            // Atualizar estatísticas
            updateStatistics(user);

            // Carregar preferências
            loadPreferences();
        }
    } catch (error) {
        console.error('Erro ao carregar perfil:', error);
        showToast('Erro ao carregar informações do perfil', 'error');
    }
}

// Atualizar estatísticas
function updateStatistics(user) {
    // Aqui você pode adicionar a lógica para buscar as estatísticas do usuário
    document.getElementById('totalEncryptions').textContent = user.usageCount || 0;
    document.getElementById('totalDecryptions').textContent = user.decryptionCount || 0;
    document.getElementById('savedKeys').textContent = user.savedKeys || 0;
}

// Habilitar edição de informações pessoais
function enableEdit() {
    const nameInput = document.getElementById('userName');
    const emailInput = document.getElementById('userEmail');
    const editButton = document.querySelector('.btn-outline');

    if (nameInput.disabled) {
        // Habilitar edição
        nameInput.disabled = false;
        nameInput.focus();
        editButton.innerHTML = '<i class="fas fa-save"></i> Salvar Alterações';
        editButton.onclick = saveChanges;
    } else {
        // Desabilitar edição
        nameInput.disabled = true;
        emailInput.disabled = true;
        editButton.innerHTML = '<i class="fas fa-edit"></i> Editar Informações';
        editButton.onclick = enableEdit;
    }
}

// Salvar alterações no perfil
async function saveChanges() {
    try {
        const name = document.getElementById('userName').value;
        const email = document.getElementById('userEmail').value;

        const response = await fetch('/api/v1/users/update', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ name, email })
        });

        if (!response.ok) {
            throw new Error('Falha ao atualizar informações');
        }

        const data = await response.json();
        
        if (data.status === 'success') {
            showToast('Informações atualizadas com sucesso!', 'success');
            enableEdit(); // Desabilitar modo de edição
        }
    } catch (error) {
        console.error('Erro ao salvar alterações:', error);
        showToast('Erro ao salvar alterações', 'error');
    }
}

// Carregar preferências do usuário
function loadPreferences() {
    // Aqui você pode adicionar a lógica para carregar as preferências do localStorage ou backend
    const autoSave = localStorage.getItem('autoSaveHistory') === 'true';
    const emailNotif = localStorage.getItem('emailNotifications') === 'true';

    document.getElementById('autoSaveHistory').checked = autoSave;
    document.getElementById('emailNotifications').checked = emailNotif;
}

// Salvar preferências
function savePreferences(event) {
    const target = event.target;
    localStorage.setItem(target.id, target.checked);
    showToast('Preferências salvas!', 'success');
}

// Mostrar toast de notificação
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast toast-${type} show`;
    
    setTimeout(() => {
        toast.className = toast.className.replace('show', '');
    }, 3000);
}

// Adicionar event listeners
document.addEventListener('DOMContentLoaded', () => {
    loadUserProfile();
    
    // Event listeners para preferências
    document.getElementById('autoSaveHistory').addEventListener('change', savePreferences);
    document.getElementById('emailNotifications').addEventListener('change', savePreferences);
});
