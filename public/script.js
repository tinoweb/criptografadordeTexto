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
        outputText.style.backgroundColor = '#f8f9fa';
    }, 200);
}

function limparTela() {
    document.getElementById('inputText').value = '';
    document.getElementById('outputText').value = '';
}
