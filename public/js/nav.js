document.addEventListener('DOMContentLoaded', async () => {
    // Marcar link ativo no menu
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('active');
        }
    });

    // Verificar autenticação
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/auth.html';
        return;
    }

    // Carregar informações do usuário
    await updateUserInfo();
});

// Função para verificar e atualizar o status do usuário
async function updateUserInfo() {
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
        console.log('Dados do usuário (nav):', data);

        if (data.status === 'success') {
            const user = data.data;
            
            // Atualizar nome do usuário
            const userNameElement = document.querySelector('.user-name');
            if (userNameElement) {
                userNameElement.textContent = user.name;
            }

            // Atualizar badge PRO
            const proBadge = document.querySelector('.pro-badge');
            if (user.subscriptionPlan === 'pro' || user.subscriptionPlan === 'enterprise') {
                if (!proBadge) {
                    const badge = document.createElement('span');
                    badge.className = 'pro-badge';
                    badge.textContent = user.subscriptionPlan.toUpperCase();
                    if (userNameElement) {
                        userNameElement.appendChild(badge);
                    }
                }
            } else if (proBadge) {
                proBadge.remove();
            }

            // Gerenciar banner de upgrade
            const upgradeBanner = document.querySelector('.upgrade-banner');
            if (upgradeBanner) {
                if (user.subscriptionPlan === 'free') {
                    upgradeBanner.innerHTML = `
                        👑 Você está usando uma conta gratuita. 
                        <a href="/plans.html" class="upgrade-link">Faça upgrade para PRO</a>
                        e tenha acesso a recursos ilimitados!
                    `;
                    upgradeBanner.style.display = 'block';
                } else {
                    upgradeBanner.style.display = 'none';
                }
            }

            // Atualizar menu do usuário
            updateUserMenu(user);
        }
    } catch (error) {
        console.error('Erro ao atualizar informações do usuário:', error);
    }
}

// Atualizar menu do usuário
function updateUserMenu(user) {
    const userMenu = document.querySelector('.user-menu');
    if (userMenu) {
        // Atualizar itens do menu baseado no plano
        const menuItems = userMenu.querySelectorAll('.menu-item');
        menuItems.forEach(item => {
            if (item.dataset.requiresPro === 'true') {
                if (user.subscriptionPlan === 'pro' || user.subscriptionPlan === 'enterprise') {
                    item.classList.remove('disabled');
                    item.removeAttribute('title');
                } else {
                    item.classList.add('disabled');
                    item.setAttribute('title', 'Recurso disponível apenas para usuários PRO');
                }
            }
        });
    }
}

// Função de logout
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    window.location.href = '/auth.html';
}
