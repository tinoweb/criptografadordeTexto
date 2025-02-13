const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

class StripeService {
    // Criar ou atualizar cliente no Stripe
    static async createOrUpdateCustomer(user) {
        try {
            let customer;
            
            if (user.stripeCustomerId) {
                // Atualizar cliente existente
                customer = await stripe.customers.update(user.stripeCustomerId, {
                    email: user.email,
                    name: user.name,
                    metadata: {
                        userId: user._id.toString()
                    }
                });
            } else {
                // Criar novo cliente
                customer = await stripe.customers.create({
                    email: user.email,
                    name: user.name,
                    metadata: {
                        userId: user._id.toString()
                    }
                });
            }

            return customer;
        } catch (error) {
            console.error('Erro no Stripe createOrUpdateCustomer:', error);
            throw new Error('Erro ao processar cliente no Stripe');
        }
    }

    // Criar sessão de checkout
    static async createCheckoutSession(user, priceId) {
        try {
            // Garantir que o usuário tem um customer_id no Stripe
            if (!user.stripeCustomerId) {
                const customer = await this.createOrUpdateCustomer(user);
                user.stripeCustomerId = customer.id;
                await user.save();
            }

            // Criar sessão de checkout
            const session = await stripe.checkout.sessions.create({
                customer: user.stripeCustomerId,
                payment_method_types: ['card'],
                line_items: [{
                    price: priceId,
                    quantity: 1
                }],
                mode: 'subscription',
                success_url: `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${process.env.FRONTEND_URL}/plans`,
                metadata: {
                    userId: user._id.toString()
                }
            });

            return session;
        } catch (error) {
            console.error('Erro no Stripe createCheckoutSession:', error);
            throw new Error('Erro ao criar sessão de pagamento');
        }
    }

    // Cancelar assinatura
    static async cancelSubscription(subscriptionId) {
        try {
            const subscription = await stripe.subscriptions.update(subscriptionId, {
                cancel_at_period_end: true
            });
            return subscription;
        } catch (error) {
            console.error('Erro no Stripe cancelSubscription:', error);
            throw new Error('Erro ao cancelar assinatura');
        }
    }

    // Obter detalhes da assinatura
    static async getSubscription(subscriptionId) {
        try {
            const subscription = await stripe.subscriptions.retrieve(subscriptionId);
            return subscription;
        } catch (error) {
            console.error('Erro no Stripe getSubscription:', error);
            throw new Error('Erro ao obter detalhes da assinatura');
        }
    }

    // Processar webhook do Stripe
    static async handleWebhookEvent(event) {
        try {
            switch (event.type) {
                case 'customer.subscription.created':
                case 'customer.subscription.updated':
                    // Atualizar status da assinatura no banco
                    await this.handleSubscriptionUpdate(event.data.object);
                    break;

                case 'customer.subscription.deleted':
                    // Marcar assinatura como cancelada
                    await this.handleSubscriptionCancellation(event.data.object);
                    break;

                case 'invoice.payment_succeeded':
                    // Registrar pagamento bem-sucedido
                    await this.handleSuccessfulPayment(event.data.object);
                    break;

                case 'invoice.payment_failed':
                    // Lidar com falha no pagamento
                    await this.handleFailedPayment(event.data.object);
                    break;
            }
        } catch (error) {
            console.error('Erro ao processar webhook do Stripe:', error);
            throw error;
        }
    }

    // Handlers de eventos específicos
    static async handleSubscriptionUpdate(subscription) {
        // Implementar lógica de atualização de assinatura
    }

    static async handleSubscriptionCancellation(subscription) {
        // Implementar lógica de cancelamento
    }

    static async handleSuccessfulPayment(invoice) {
        // Implementar lógica de pagamento bem-sucedido
    }

    static async handleFailedPayment(invoice) {
        // Implementar lógica de pagamento falho
    }
}

module.exports = StripeService;
