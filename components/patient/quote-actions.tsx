'use client'

import { Button } from '@/components/ui/button'
import { CheckCircle, CreditCard, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

interface QuoteActionsProps {
    quoteId: string
    bookingId?: string
    quoteStatus: string
    bookingStatus?: string
    totalAmount: number
    currency: string
}

export function QuoteActions({
    quoteId,
    bookingId,
    quoteStatus,
    bookingStatus,
    totalAmount,
    currency
}: QuoteActionsProps) {
    const [loading, setLoading] = useState(false)

    // 1. Accept Quote (Create Booking logic typically happens here or backend)
    // For MVP, we assume a booking is pre-created or created upon acceptance.
    // We'll skip complex "Create Booking" logic if it doesn't exist, and focus on Payment if Booking exists.

    const handlePayDeposit = async () => {
        if (!bookingId) {
            toast.error('No booking linked to this quote yet.')
            return
        }

        setLoading(true)
        try {
            const response = await fetch('/api/payments/create-checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    bookingId,
                    paymentType: 'deposit',
                    successUrl: `${window.location.origin}/patient/dashboard?payment=success`,
                    cancelUrl: `${window.location.origin}/patient/quotes/${quoteId}`,
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || 'Payment initiation failed')
            }

            // Redirect to Stripe
            window.location.href = data.checkoutUrl
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Payment failed'
            console.error('Payment Error:', error)
            toast.error(message)
            setLoading(false)
        }
    }

    // If Quote is Ready but not Accepted
    if (quoteStatus === 'READY' || quoteStatus === 'SENT' || quoteStatus === 'VIEWED') {
        return (
            <div className="flex flex-col gap-4 mt-8 p-6 bg-teal-50 rounded-lg border border-teal-100">
                <h3 className="font-semibold text-teal-900">Next Step: Accept this Quote</h3>
                <p className="text-sm text-teal-700">
                    By accepting this quote, you reserve your procedure date. A 30% deposit will be required to confirm.
                </p>
                <div className="flex gap-4">
                    <Button
                        className="w-full bg-teal-600 hover:bg-teal-700"
                        onClick={() => toast.info('Acceptance logic triggers here (Contact Coordinator)')}
                    >
                        Contact Coordinator to Accept
                    </Button>
                </div>
            </div>
        )
    }

    // If Booking is Confirmed but not Paid
    if (bookingId && (bookingStatus === 'PENDING' || bookingStatus === 'CONFIRMED')) {
        return (
            <div className="flex flex-col gap-4 mt-8 p-6 bg-indigo-50 rounded-lg border border-indigo-100">
                <h3 className="font-semibold text-indigo-900 flex items-center gap-2">
                    <CreditCard className="w-5 h-5" /> Secure Your Booking
                </h3>
                <p className="text-sm text-indigo-700">
                    Please pay the deposit to finalize your medical journey details.
                </p>
                <div className="flex justify-between items-center py-2 border-b border-indigo-200">
                    <span className="text-sm text-indigo-800">Total Amount</span>
                    <span className="font-bold text-lg">{currency} {totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-indigo-800">Deposit Due (30%)</span>
                    <span className="font-bold text-lg">{currency} {(totalAmount * 0.3).toLocaleString()}</span>
                </div>

                <Button
                    onClick={handlePayDeposit}
                    disabled={loading}
                    className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700"
                >
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Pay Deposit with Stripe
                </Button>
                <p className="text-xs text-center text-gray-500 mt-2">
                    Secured by Stripe SSL Encryption
                </p>
            </div>
        )
    }

    if (bookingStatus === 'DEPOSIT_PAID' || bookingStatus === 'FULLY_PAID') {
        return (
            <div className="mt-8 p-6 bg-green-50 rounded-lg border border-green-100 flex items-center gap-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <div>
                    <h3 className="font-semibold text-green-900">Payment Confirmed</h3>
                    <p className="text-sm text-green-700">Your deposit has been received. Your coordinator will send your itinerary shortly.</p>
                </div>
            </div>
        )
    }

    return null
}
