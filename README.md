# Criptografador de Texto - Sistema de Ofuscação Visual

## 📝 Descrição
O Criptografador de Texto é uma ferramenta web que permite criar textos visualmente idênticos aos originais, mas com diferentes codificações subjacentes. Esta técnica é conhecida como "ofuscação visual" ou "homoglifos", onde caracteres visualmente similares de diferentes conjuntos Unicode são utilizados para criar textos que parecem idênticos mas têm códigos diferentes.

## 🚀 Funcionalidades

### 1. Três Métodos de Criptografia

#### E-mail
- **Técnica**: Inversão RTL (Right-to-Left)
- **Como funciona**: Utiliza o caractere Unicode RTL Override (U+202E) para inverter a direção do texto
- **Uso**: Ideal para situações onde o texto precisa aparecer invertido mas manter sua legibilidade
- **Exemplo**:
  - Entrada: "texto exemplo"
  - Saída: "‮olpmexe otxet"

#### SMS e Marcas
- **Técnica**: Substituição por Homoglifos Cirílicos
- **Como funciona**: Substitui caracteres latinos por seus equivalentes cirílicos visualmente idênticos
- **Caracteres substituídos**:
  - a → а (cirílico)
  - e → е (cirílico)
  - i → і (cirílico)
  - o → о (cirílico)
  - s → ѕ (cirílico)
  - m → м (cirílico)
- **Exemplo**:
  - Entrada: "ganhar 2 milhoes"
  - Saída: "gаnhаr 2 міlhоеѕ"

#### Anúncios e Sites
- **Técnica**: Homoglifos + Zero-Width Space
- **Como funciona**: Combina a substituição por caracteres cirílicos com espaços invisíveis (U+200B)
- **Característica**: Adiciona um zero-width space entre cada caractere
- **Exemplo**:
  - Entrada: "exemplo"
  - Saída: "‎е‎х‎е‎м‎р‎l‎о" (com zero-width space entre cada letra)

## 💡 Como Usar

1. **Entrada de Texto**
   - Digite ou cole seu texto na área superior
   - O texto pode incluir letras, números e espaços

2. **Escolha do Método**
   - Clique em um dos três botões disponíveis:
     - E-mail
     - SMS e Marcas
     - Anúncios e Sites

3. **Resultado**
   - O texto criptografado aparecerá na área inferior
   - Use o botão "Copiar" para copiar o resultado
   - Use "Limpar Tela" para recomeçar

## 🔧 Aspectos Técnicos

### Caracteres Unicode Especiais Utilizados
- **RTL Override**: \u202E
- **Zero-Width Space**: \u200B
- **Caracteres **:
  - а (U+0430)
  - е (U+0435)
  - і (U+0456)
  - о (U+043E)
  - ѕ (U+0455)
  - м (U+043C)

### Implementação
- HTML5 para estrutura
- CSS3 para estilização
- JavaScript puro para funcionalidades
- Sem dependências externas

## 📚 Possíveis Aplicações

1. **Marketing Digital**
   - Criação de textos únicos para anúncios
   - Diferenciação em posts de redes sociais
   - Destaque em e-mail marketing

2. **Desenvolvimento Web**
   - Textos personalizados para sites
   - Conteúdo diferenciado para blogs
   - Títulos e descrições únicas

3. **Comunicação**
   - Mensagens personalizadas
   - Conteúdo criativo para SMS
   - Textos diferenciados para campanhas

## ⚠️ Considerações Importantes

1. **Uso Ético**
   - A ferramenta deve ser usada de forma responsável
   - Evite usar para spam ou conteúdo enganoso
   - Respeite as políticas das plataformas onde o texto será usado

2. **Limitações**
   - Nem todos os caracteres têm equivalentes cirílicos
   - Alguns sistemas podem não exibir corretamente os caracteres especiais
   - O texto pode ser detectado como diferente por sistemas automatizados

3. **Compatibilidade**
   - Funciona melhor em navegadores modernos
   - Requer suporte a Unicode
   - Pode ter comportamento diferente em dispositivos móveis

## 🎯 Dicas para Criação de Conteúdo

### Para YouTube
1. **Estrutura do Vídeo**
   - Introdução ao conceito de ofuscação visual
   - Demonstração prática de cada método
   - Explicação técnica do funcionamento
   - Casos de uso e aplicações práticas

2. **Pontos a Destacar**
   - Interface intuitiva
   - Diferentes métodos de criptografia
   - Aplicações práticas
   - Aspectos técnicos interessantes

### Para Artigo
1. **Tópicos Principais**
   - O que é ofuscação visual
   - Como funciona cada método
   - Aspectos técnicos do Unicode
   - Casos de uso práticos

2. **Estrutura Sugerida**
   - Introdução ao conceito
   - Explicação detalhada dos métodos
   - Demonstração com exemplos
   - Considerações técnicas
   - Aplicações práticas
   - Conclusão e recomendações

## 🔄 Atualizações Futuras Possíveis

1. **Funcionalidades**
   - Mais opções de caracteres especiais
   - Previews em tempo real
   - Histórico de conversões
   - Opções de personalização

2. **Interface**
   - Temas claros/escuros
   - Responsividade melhorada
   - Mais opções de formatação
   - Interface multilíngue

## 📱 Compatibilidade

- Chrome 49+
- Firefox 52+
- Safari 10+
- Edge 79+
- Opera 36+

## 👥 Contribuição

Para contribuir com o projeto:
1. Faça um fork do repositório
2. Crie uma branch para sua feature
3. Faça commit das mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.
