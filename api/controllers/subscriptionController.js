const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Criar sessão de checkout
exports.createCheckoutSession = catchAsync(async (req, res, next) => {
    const { plan } = req.body;
    const user = req.user;

    if (!plan) {
        return next(new AppError('Por favor, selecione um plano', 400));
    }

    let priceId;
    if (plan === 'pro') {
        priceId = process.env.STRIPE_PRO_PRICE_ID;
    } else if (plan === 'enterprise') {
        priceId = process.env.STRIPE_ENTERPRISE_PRICE_ID;
    } else {
        return next(new AppError('Plano inválido', 400));
    }

    // Criar ou recuperar cliente no Stripe
    let customer;
    if (user.stripeCustomerId) {
        customer = user.stripeCustomerId;
    } else {
        const stripeCustomer = await stripe.customers.create({
            email: user.email,
            metadata: {
                userId: user._id.toString()
            }
        });
        customer = stripeCustomer.id;
        
        // Atualizar usuário com ID do cliente Stripe
        await User.findByIdAndUpdate(user._id, {
            stripeCustomerId: customer
        });
    }

    // Criar sessão de checkout
    const session = await stripe.checkout.sessions.create({
        customer: customer,
        payment_method_types: ['card'],
        line_items: [{
            price: priceId,
            quantity: 1
        }],
        mode: 'subscription',
        success_url: `${process.env.FRONTEND_URL}/plans.html?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL}/plans.html`,
        metadata: {
            userId: user._id.toString(),
            plan: plan
        }
    });

    res.status(200).json({
        status: 'success',
        id: session.id
    });
});

// Verificar status do pagamento
exports.verifyPayment = catchAsync(async (req, res, next) => {
    const { sessionId } = req.params;

    try {
        console.log('Verificando pagamento para sessão:', sessionId);
        
        const session = await stripe.checkout.sessions.retrieve(sessionId, {
            expand: ['subscription']
        });
        console.log('Sessão do Stripe:', session);

        if (session.payment_status === 'paid') {
            // Atualizar diretamente usando o modelo
            const user = await User.findById(req.user._id);
            if (!user) {
                throw new Error('Usuário não encontrado');
            }

            // Atualizar campos manualmente
            user.subscriptionStatus = 'active';
            user.subscriptionPlan = 'pro';
            user.subscriptionId = session.subscription.id;
            user.updatedAt = new Date();

            // Salvar as alterações
            await user.save();
            console.log('Usuário atualizado:', user);

            // Verificar a atualização
            const verifiedUser = await User.findById(req.user._id);
            console.log('Verificação após atualização:', verifiedUser);

            if (verifiedUser.subscriptionPlan !== 'pro') {
                throw new Error('Falha na atualização do plano');
            }

            res.status(200).json({
                status: 'success',
                data: {
                    user: {
                        id: verifiedUser._id,
                        name: verifiedUser.name,
                        email: verifiedUser.email,
                        subscriptionPlan: verifiedUser.subscriptionPlan,
                        subscriptionStatus: verifiedUser.subscriptionStatus
                    }
                },
                message: 'Pagamento processado com sucesso!'
            });
        } else {
            throw new Error(`Pagamento não confirmado. Status: ${session.payment_status}`);
        }
    } catch (error) {
        console.error('Erro ao processar pagamento:', error);
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
});

// Webhook do Stripe
exports.webhook = catchAsync(async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.error('Erro no webhook:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    console.log('Evento do Stripe recebido:', event.type);

    // Handle the event
    switch (event.type) {
        case 'checkout.session.completed':
            const session = event.data.object;
            console.log('Checkout completado:', session);
            
            // Atualizar usuário
            await User.findOneAndUpdate(
                { _id: session.metadata.userId },
                {
                    $set: {
                        subscriptionStatus: 'active',
                        subscriptionPlan: session.metadata.plan,
                        subscriptionId: session.subscription,
                        updatedAt: new Date()
                    }
                },
                { new: true }
            );
            break;

        case 'customer.subscription.updated':
            const subscription = event.data.object;
            console.log('Assinatura atualizada:', subscription);
            break;

        case 'customer.subscription.deleted':
            const canceledSubscription = event.data.object;
            console.log('Assinatura cancelada:', canceledSubscription);
            
            await User.findOneAndUpdate(
                { subscriptionId: canceledSubscription.id },
                {
                    $set: {
                        subscriptionStatus: 'canceled',
                        subscriptionPlan: 'free',
                        updatedAt: new Date()
                    },
                    $unset: { subscriptionId: "" }
                }
            );
            break;
    }

    res.json({ received: true });
});
