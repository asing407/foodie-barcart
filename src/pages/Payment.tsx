import React, { useState, useEffect, FormEvent } from 'react';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Define basket item type (adjust as per your app's structure)
interface BasketItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
}

// Props for PaymentPage
interface PaymentPageProps {
    basket: BasketItem[];
    totalAmount: number; // Amount in smallest currency unit (e.g., cents)
}

// Stripe initialization
const stripePromise: Promise<Stripe | null> = loadStripe('your-stripe-publishable-key');

const PaymentPage: React.FC<PaymentPageProps> = ({ basket, totalAmount }) => {
    const stripe = useStripe();
    const elements = useElements();

    // States
    const [clientSecret, setClientSecret] = useState<string>('');
    const [message, setMessage] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        // Fetch client secret when component loads
        fetch('/create-payment-intent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ totalAmount }),
        })
            .then((res) => res.json())
            .then((data) => setClientSecret(data.clientSecret))
            .catch((err) => console.error('Error fetching client secret:', err));
    }, [totalAmount]);

    const handlePayment = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        if (!stripe || !elements) {
            setMessage('Stripe.js has not loaded yet.');
            setLoading(false);
            return;
        }

        const cardElement = elements.getElement(CardElement);

        if (!cardElement) {
            setMessage('Card Element is not available.');
            setLoading(false);
            return;
        }

        try {
            const { paymentIntent, error } = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: cardElement,
                    billing_details: { name: 'Customer Name' }, // Replace with real customer info
                },
            });

            if (error) {
                setMessage(`Payment failed: ${error.message}`);
            } else if (paymentIntent?.status === 'succeeded') {
                setMessage('Payment successful! Redirecting...');
                setTimeout(() => (window.location.href = '/success'), 3000);
            }
        } catch (err) {
            setMessage('An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h2>Payment</h2>
            <p>Order Total: ${(totalAmount / 100).toFixed(2)}</p>
            <form onSubmit={handlePayment}>
                <CardElement />
                <button type="submit" disabled={!stripe || loading}>
                    {loading ? 'Processing...' : 'Pay Now'}
                </button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
};

const App: React.FC<{ basket: BasketItem[]; totalAmount: number }> = ({ basket, totalAmount }) => (
    <Elements stripe={stripePromise}>
        <PaymentPage basket={basket} totalAmount={totalAmount} />
    </Elements>
);

export default App;
