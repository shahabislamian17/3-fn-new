import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '@/middleware/auth.middleware';
import { stripe } from '@/core/stripe';

export const createCheckoutSession = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const user = req.user!;
        const { amount, metadata, success_url, cancel_url } = req.body;

        if (!amount) {
            return res.status(400).json({ error: 'Amount is required.' });
        }

        const session = await stripe.checkout.sessions.create({
            mode: 'payment',
            payment_method_types: ['card'],
            customer_email: user.email,
            line_items: [
                {
                    price_data: {
                        currency: metadata.currency || 'usd',
                        product_data: { name: metadata?.projectName || 'Investment' },
                        unit_amount: Math.round(amount * 100),
                    },
                    quantity: 1,
                },
            ],
            payment_intent_data: {
                metadata: {
                    ...metadata,
                    userId: user.id, // Ensure userId is in metadata
                },
            },
            success_url: success_url || `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: cancel_url || `${process.env.FRONTEND_URL}/cancel`,
        });

        if (!session) {
            throw new Error('Could not create Stripe session.');
        }

        res.json({ id: session.id, url: session.url });

    } catch (err) {
        next(err);
    }
};
