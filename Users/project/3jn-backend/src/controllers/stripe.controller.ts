import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '@/middleware/auth.middleware';
import { stripe } from '@/core/stripe';
import { adminDb } from '@/core/firebase';

const APP_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

export const createConnectedAccount = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const user = req.user!;
        
        if (user.stripeAccountId) {
            return res.json({ accountId: user.stripeAccountId });
        }

        const account = await stripe.accounts.create({
            type: 'express',
            email: user.email,
            business_type: 'individual',
        });

        await adminDb.collection('users').doc(user.id).set({
            stripeAccountId: account.id,
            stripe_onboard_status: 'pending',
        }, { merge: true });

        res.json({ accountId: account.id });

    } catch (err) {
        next(err);
    }
};

export const createOnboardingLink = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const user = req.user!;
        if (!user.stripeAccountId) {
            return res.status(400).json({ error: 'Stripe account not found for user.' });
        }

        const accountLink = await stripe.accountLinks.create({
            account: user.stripeAccountId,
            refresh_url: `${APP_URL}/dashboard/account?refresh=stripe`,
            return_url: `${APP_URL}/dashboard/account?onboarding=success`,
            type: 'account_onboarding',
        });

        res.json({ url: accountLink.url });
    } catch (err) {
        next(err);
    }
};

export const stripeWebhook = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const sig = req.headers['stripe-signature'] as string;
    
    if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
      return res.status(400).send('Missing Stripe signature or secret');
    }

    let event;
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err: any) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
        switch (event.type) {
            case 'account.updated': {
                const account = event.data.object as any;
                const isVerified = account.details_submitted && account.charges_enabled;
                const userQuery = await adminDb.collection('users').where('stripeAccountId', '==', account.id).limit(1).get();
                if (!userQuery.empty) {
                    const userDoc = userQuery.docs[0];
                    await userDoc.ref.update({
                        stripeConnected: isVerified,
                        stripe_onboard_status: isVerified ? 'completed' : 'pending',
                    });
                }
                break;
            }
            case 'checkout.session.completed': {
                const session = event.data.object as any;
                const { userId, projectId, investmentAmount, platformFee } = session.metadata || {};
                
                if (userId && projectId && investmentAmount) {
                    const investmentData = {
                        userId,
                        projectId,
                        amount: parseFloat(investmentAmount),
                        platformFee: parseFloat(platformFee),
                        totalPaid: session.amount_total ? session.amount_total / 100 : 0,
                        status: 'Active',
                        date: new Date().toISOString(),
                        stripePaymentIntentId: session.payment_intent,
                    };
                    await adminDb.collection('investments').add(investmentData);
                    
                    const projectRef = adminDb.collection('projects').doc(projectId);
                    const projectDoc = await projectRef.get();
                    if (projectDoc.exists) {
                        const projectData = projectDoc.data()!;
                        const newRaisedAmount = (projectData.raisedAmount || 0) + parseFloat(investmentAmount);
                        const newInvestorCount = (projectData.investorCount || 0) + 1;
                        await projectRef.update({ raisedAmount: newRaisedAmount, investorCount: newInvestorCount });
                    }
                }
                break;
            }
            default:
                // Unhandled event type
        }
        res.status(200).json({ received: true });
    } catch (err) {
        next(err);
    }
};
