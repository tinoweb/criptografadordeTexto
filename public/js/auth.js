// Funções de autenticação
function isLoggedIn() {
    return localStorage.getItem('token') !== null;
}

function getUser() {
    return JSON.parse(localStorage.getItem('user') || 'null');
}

async function checkAuthStatus() {
    // Se estiver na página de autenticação, não fazer nada
    if (window.location.pathname === '/auth') {
        return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
        updateUIForLoggedOut();
        return;
    }

    try {
        const response = await fetch('/api/v1/auth/me', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();
        if (data.success) {
            localStorage.setItem('user', JSON.stringify(data.user));
            updateUIForLoggedIn(data.user);
        } else {
            // Se o token for inválido, apenas limpar os dados e atualizar UI
            clearAuthData();
            updateUIForLoggedOut();
        }
    } catch (error) {
        console.error('Erro ao verificar status de autenticação:', error);
        clearAuthData();
        updateUIForLoggedOut();
    }
}

function updateUIForLoggedIn(user) {
    const authNav = document.getElementById('authNav');
    if (authNav) {
        authNav.innerHTML = `
            <span class="user-info">Olá, ${user.name}</span>
            <button onclick="logout()" class="nav-btn logout-btn">Sair</button>
        `;
    }

    // Atualizar elementos que devem ser mostrados apenas para usuários logados
    document.querySelectorAll('.logged-in-only').forEach(el => {
        el.style.display = 'block';
    });

    document.querySelectorAll('.logged-out-only').forEach(el => {
        el.style.display = 'none';
    });
}

function updateUIForLoggedOut() {
    const authNav = document.getElementById('authNav');
    if (authNav) {
        authNav.innerHTML = `
            <a href="/auth" class="nav-btn">Login</a>
            <a href="/auth?tab=register" class="nav-btn register-btn">Registrar</a>
        `;
    }

    // Atualizar elementos que devem ser mostrados apenas para usuários não logados
    document.querySelectorAll('.logged-in-only').forEach(el => {
        el.style.display = 'none';
    });

    document.querySelectorAll('.logged-out-only').forEach(el => {
        el.style.display = 'block';
    });
}

function clearAuthData() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
}

function logout() {
    clearAuthData();
    updateUIForLoggedOut();
    window.location.href = '/auth';
}

// Verificar status de autenticação quando a página carregar
document.addEventListener('DOMContentLoaded', checkAuthStatus);
