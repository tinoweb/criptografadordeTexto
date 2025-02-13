// Estado do usuário
let currentPlan = 'free';
let isLoading = false;

// Elementos da UI
const proPlanBtn = document.getElementById('proPlanBtn');
const enterprisePlanBtn = document.getElementById('enterprisePlanBtn');
const freePlanBtn = document.getElementById('freePlanBtn');

// Função para mostrar toast melhorada
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    document.body.appendChild(toast);
    
    // Força um reflow
    toast.offsetHeight;
    
    // Adiciona a classe show
    toast.classList.add('show');

    // Remove após 5 segundos
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 5000);
}

// Função para atualizar UI baseado no plano do usuário
async function updateUI() {
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
            const proSection = document.querySelector('.pro-plan');
            const enterpriseSection = document.querySelector('.enterprise-plan');
            
            if (user.subscriptionPlan === 'pro') {
                // Usuário já é PRO
                if (proSection) {
                    const button = proSection.querySelector('.upgrade-button');
                    if (button) {
                        button.textContent = 'Plano Atual';
                        button.disabled = true;
                        button.classList.add('current-plan');
                    }
                    
                    // Adicionar badge PRO
                    const badge = document.createElement('div');
                    badge.className = 'pro-badge';
                    badge.textContent = 'SEU PLANO ATUAL';
                    proSection.querySelector('.plan-header').appendChild(badge);
                    
                    // Atualizar texto do cabeçalho
                    const welcomeHeader = document.querySelector('.welcome-header');
                    if (welcomeHeader) {
                        welcomeHeader.innerHTML = `
                            <h1>Bem-vindo ao Plano PRO!</h1>
                            <p>Aproveite todos os recursos premium disponíveis para você.</p>
                        `;
                    }
                }
                
                // Desabilitar upgrade para Enterprise se já for PRO
                if (enterpriseSection) {
                    const enterpriseButton = enterpriseSection.querySelector('.upgrade-button');
                    if (enterpriseButton) {
                        enterpriseButton.textContent = 'Fazer Upgrade';
                    }
                }

                // Esconder banner de upgrade
                const upgradeBanner = document.querySelector('.upgrade-banner');
                if (upgradeBanner) {
                    upgradeBanner.style.display = 'none';
                }
            }
            
            // Atualizar o banner de navegação
            updateNavBanner(user.subscriptionPlan);
        }
    } catch (error) {
        console.error('Erro ao atualizar UI:', error);
        showToast('Erro ao carregar informações do usuário', 'error');
    }
}

// Atualizar banner de navegação
function updateNavBanner(plan) {
    const upgradeBanner = document.querySelector('.upgrade-banner');
    const welcomeBanner = document.querySelector('.welcome-banner');
    
    if (plan === 'pro' || plan === 'enterprise') {
        // Esconder banner de upgrade
        if (upgradeBanner) {
            upgradeBanner.style.display = 'none';
        }
        
        // Mostrar banner de boas-vindas
        if (welcomeBanner) {
            welcomeBanner.style.display = 'block';
            welcomeBanner.innerHTML = `
                <div class="welcome-content">
                    <span class="pro-icon">⭐</span>
                    <span class="welcome-text">Bem-vindo ao Plano ${plan.toUpperCase()}!</span>
                </div>
            `;
        }
    }
}

// Função para selecionar plano
async function selectPlan(plan) {
    if (!plan) {
        showToast('Plano inválido', 'error');
        return;
    }

    try {
        // Desabilitar botão durante o processamento
        const button = document.querySelector(`#${plan}PlanBtn`);
        button.disabled = true;
        button.textContent = 'Processando...';

        // Criar sessão de checkout
        const response = await fetch('/api/v1/subscriptions/create-checkout-session', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ plan: plan }) // Garantindo que o plan está sendo enviado corretamente
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Erro ao criar sessão de checkout');
        }

        // Redirecionar para checkout do Stripe
        const { error } = await stripe.redirectToCheckout({
            sessionId: data.id
        });

        if (error) {
            throw new Error(error.message);
        }
    } catch (error) {
        console.error('Erro:', error);
        showToast(error.message || 'Erro ao processar pagamento. Tente novamente.', 'error');
    } finally {
        // Reabilitar botão
        const button = document.querySelector(`#${plan}PlanBtn`);
        button.disabled = false;
        button.textContent = plan === 'pro' ? 'Assinar Pro' : 'Contatar Vendas';
    }
}

// Verificar status do pagamento
async function checkPaymentStatus() {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');

    if (!sessionId) return;

    try {
        console.log('Verificando status do pagamento para sessão:', sessionId);
        const response = await fetch(`/api/v1/subscriptions/verify-payment/${sessionId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        const data = await response.json();
        console.log('Resposta da verificação de pagamento:', data);

        if (response.ok && data.status === 'success') {
            // Limpar URL
            window.history.replaceState({}, document.title, '/plans.html');
            
            // Mostrar mensagem de sucesso
            showToast('Assinatura PRO ativada com sucesso! Aproveite todos os recursos premium.', 'success');
            
            // Forçar atualização das informações do usuário
            if (typeof updateUserInfo === 'function') {
                console.log('Atualizando informações do usuário...');
                await updateUserInfo();
                
                // Recarregar a página após um breve delay
                setTimeout(() => {
                    console.log('Recarregando página...');
                    window.location.reload();
                }, 2000);
            }
        } else {
            throw new Error(data.message || 'Erro ao verificar pagamento');
        }
    } catch (error) {
        console.error('Erro ao verificar pagamento:', error);
        showToast(error.message || 'Erro ao verificar status do pagamento', 'error');
    }
}

// Função para atualizar status do plano na interface
async function updatePlanStatus() {
    try {
        const response = await fetch('/api/v1/auth/me', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        const { data: user } = await response.json();

        // Atualizar botões baseado no plano atual
        const freePlanBtn = document.querySelector('#freePlanBtn');
        const proPlanBtn = document.querySelector('#proPlanBtn');
        const enterprisePlanBtn = document.querySelector('#enterprisePlanBtn');

        if (user.subscriptionPlan === 'pro') {
            proPlanBtn.textContent = 'Plano Atual';
            proPlanBtn.disabled = true;
            freePlanBtn.style.display = 'none';
            enterprisePlanBtn.textContent = 'Fazer Upgrade';
        } else if (user.subscriptionPlan === 'enterprise') {
            enterprisePlanBtn.textContent = 'Plano Atual';
            enterprisePlanBtn.disabled = true;
            freePlanBtn.style.display = 'none';
            proPlanBtn.style.display = 'none';
        } else {
            freePlanBtn.textContent = 'Plano Atual';
            freePlanBtn.disabled = true;
        }
    } catch (error) {
        console.error('Erro ao atualizar status do plano:', error);
    }
}

// Esperar o Stripe carregar antes de inicializar
let stripe;

document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Inicializar Stripe com a chave pública
        stripe = Stripe('pk_test_51NfmrVKVNzqiA2cZmEPQe7uR66BZZy0FfymeW3paSsdrJmEKOlS0nPv50oHE3Dpxybt0eKb49lREGI2kAAUpDdWQ00Apy1f4UM');
        
        // Verificar status do pagamento e atualizar UI
        await checkPaymentStatus();
        await updatePlanStatus();
    } catch (error) {
        console.error('Erro ao inicializar Stripe:', error);
        showToast('Erro ao carregar informações de pagamento', 'error');
    }
});
