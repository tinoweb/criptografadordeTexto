document.addEventListener('DOMContentLoaded', () => {
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

    // Carregar nome do usuário
    const userName = localStorage.getItem('userName');
    if (userName) {
        document.getElementById('userName').textContent = userName;
    }
});
