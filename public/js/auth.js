// Funções de autenticação
function isLoggedIn() {
    return localStorage.getItem('token') !== null;
}

function getUser() {
    return JSON.parse(localStorage.getItem('user') || 'null');
}

async function checkAuthStatus() {
    const token = localStorage.getItem('token');
    const currentPath = window.location.pathname;

    // Se estiver na página de autenticação
    if (currentPath === '/auth.html') {
        if (token) {
            // Se já estiver logado, redirecionar para a página inicial
            window.location.href = '/';
        }
        return;
    }

    // Se não estiver na página de autenticação e não tiver token
    if (!token) {
        window.location.href = '/auth.html';
        return;
    }

    try {
        const response = await fetch('/api/v1/auth/me', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Token inválido');
        }

        const data = await response.json();
        if (!data.success) {
            throw new Error(data.error || 'Erro na verificação do token');
        }

        // Token válido, atualizar dados do usuário
        localStorage.setItem('user', JSON.stringify(data.data));
        updateUIForLoggedIn(data.data);
        
    } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        clearAuthData();
        window.location.href = '/auth.html';
    }
}

function updateUIForLoggedIn(user) {
    const authNav = document.getElementById('authNav');
    if (authNav) {
        authNav.innerHTML = `
            <div class="nav-menu">
                <a href="/history.html" class="nav-link">
                    <i class="fas fa-history"></i>
                    Histórico
                </a>
                <a href="/profile.html" class="nav-link">
                    <i class="fas fa-user-circle"></i>
                    Perfil
                </a>
            </div>
            <span class="user-greeting">
                <i class="fas fa-user"></i>
                Olá, <span id="userName">${user.name}</span>
            </span>
            <button class="logout-btn" onclick="logout()">
                <i class="fas fa-sign-out-alt"></i>
                Sair
            </button>
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
            <a href="/auth.html" class="nav-btn">Login</a>
            <a href="/auth.html?tab=register" class="nav-btn register-btn">Registrar</a>
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
    updateUIForLoggedOut();
}

function logout() {
    clearAuthData();
    window.location.href = '/auth.html';
}

// Verificar status de autenticação quando a página carregar
document.addEventListener('DOMContentLoaded', checkAuthStatus);
