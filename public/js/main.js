// Funções de criptografia
function criptografar(tipo) {
    const inputText = document.getElementById('inputText').value;
    if (!inputText) {
        alert('Por favor, digite um texto para criptografar.');
        return;
    }

    let encryptedText = '';
    
    // Mapa de caracteres cirílicos
    const cirilicMap = {
        'a': 'а', // cirílico
        'e': 'е', // cirílico
        'i': 'і', // cirílico
        'o': 'о', // cirílico
        's': 'ѕ', // cirílico
        'c': 'с', // cirílico
        'm': 'м', // cirílico
        'h': 'h',
        'r': 'r',
        'g': 'g',
        'l': 'l',
        'n': 'n',
        'd': 'd',
        'u': 'u',
        ' ': ' ',
        '2': '2',
        '3': '3',
        'v': 'ѵ', // cirílico
        'p': 'р', // cirílico
        't': 'т', // cirílico
        'y': 'у', // cirílico
        'b': 'в', // cirílico
    };
    
    switch(tipo) {
        case 'email':
            // Inverte o texto com RTL para e-mails
            encryptedText = '\u202E' + inputText.split('').reverse().join('');
            break;
            
        case 'sms':
            // Substitui por caracteres cirílicos para SMS
            encryptedText = inputText.split('').map(char => {
                return cirilicMap[char.toLowerCase()] || char;
            }).join('');
            break;
            
        case 'anuncios':
            // Substitui por caracteres cirílicos com zero-width space
            encryptedText = inputText.split('').map(char => {
                const mappedChar = cirilicMap[char.toLowerCase()] || char;
                return '\u200B' + mappedChar;
            }).join('');
            break;
    }
    
    document.getElementById('outputText').value = encryptedText;

    // Se estiver logado, salva no histórico
    if (isLoggedIn()) {
        saveToHistory(inputText, encryptedText, tipo);
    }
}

async function saveToHistory(originalText, encryptedText, encryptionType) {
    try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch('/api/v1/history', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                originalText,
                encryptedText,
                encryptionType
            })
        });

        const data = await response.json();
        if (!data.success) {
            throw new Error(data.error);
        }
    } catch (error) {
        console.error('Erro ao salvar no histórico:', error);
    }
}

function gerarTextoCriptografado(length) {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    return Array(length).fill(0).map(() => chars[Math.floor(Math.random() * chars.length)]).join('');
}

function copiarTexto() {
    const outputText = document.getElementById('outputText');
    outputText.select();
    document.execCommand('copy');
    
    // Feedback visual
    outputText.style.backgroundColor = '#e8f5e9';
    setTimeout(() => {
        outputText.style.backgroundColor = 'transparent';
    }, 200);
}

function limparTela() {
    document.getElementById('inputText').value = '';
    document.getElementById('outputText').value = '';
}

function showAlert(message, type = 'info') {
    const alertElement = document.createElement('div');
    alertElement.className = `alert alert-${type}`;
    alertElement.textContent = message;

    const container = document.querySelector('.container');
    container.insertBefore(alertElement, container.firstChild);

    setTimeout(() => {
        alertElement.remove();
    }, 3000);
}

// Verificar se o usuário está logado
function isLoggedIn() {
    return localStorage.getItem('token') !== null;
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    const encryptionType = document.getElementById('encryptionType');
    const customKeyContainer = document.getElementById('customKeyContainer');

    encryptionType?.addEventListener('change', (e) => {
        if (e.target.value === 'custom') {
            customKeyContainer.style.display = 'block';
        } else {
            customKeyContainer.style.display = 'none';
        }
    });

    // Inicializar estado do customKeyContainer
    if (encryptionType?.value === 'custom') {
        customKeyContainer.style.display = 'block';
    }
});
