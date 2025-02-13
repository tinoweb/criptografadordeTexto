require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function createProducts() {
    try {
        // Criar produto Pro
        const proPlan = await stripe.products.create({
            name: 'Plano Pro',
            description: 'Acesso ilimitado a todas as funcionalidades de criptografia',
            images: ['https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=80'], // Imagem de segurança digital
            default_price_data: {
                currency: 'brl',
                unit_amount: 2900, // R$ 29.00
                recurring: {
                    interval: 'month'
                }
            }
        });

        console.log('Plano Pro criado:');
        console.log(`ID do Produto: ${proPlan.id}`);
        console.log(`ID do Preço: ${proPlan.default_price}`);
        
        // Criar produto Enterprise
        const enterprisePlan = await stripe.products.create({
            name: 'Plano Enterprise',
            description: 'Solução personalizada para empresas com suporte dedicado',
            images: ['https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80'], // Imagem de tecnologia empresarial
            default_price_data: {
                currency: 'brl',
                unit_amount: 9900, // R$ 99.00
                recurring: {
                    interval: 'month'
                }
            }
        });

        console.log('\nPlano Enterprise criado:');
        console.log(`ID do Produto: ${enterprisePlan.id}`);
        console.log(`ID do Preço: ${enterprisePlan.default_price}`);

        console.log('\nAtualize seu arquivo .env com os IDs dos preços acima!');
    } catch (error) {
        console.error('Erro ao criar produtos:', error);
    }
}

createProducts();
