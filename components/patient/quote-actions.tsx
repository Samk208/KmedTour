'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { CheckCircle, CreditCard, Loader2, XCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

interface QuoteActionsProps {
  readonly quoteId: string
  readonly bookingId?: string
  readonly quoteStatus: string
  readonly bookingStatus?: string
  readonly totalAmount: number
  readonly currency: string
}

export function QuoteActions({
  quoteId,
  bookingId,
  quoteStatus,
  bookingStatus,
  totalAmount,
  currency,
}: QuoteActionsProps) {
  const router = useRouter()
  const [accepting, setAccepting] = useState(false)
  const [rejecting, setRejecting] = useState(false)
  const [payLoading, setPayLoading] = useState(false)

  const handleAccept = async () => {
    setAccepting(true)
    try {
      const response = await fetch(`/api/quotes/${quoteId}/accept`, {
        method: 'POST',
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to accept quote')
      }

      toast.success('Quote accepted! A booking has been created for you.')
      // Refresh server data and redirect to dashboard
      router.refresh()
      router.push(`/patient/dashboard?accepted=true`)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to accept quote'
      toast.error(message)
    } finally {
      setAccepting(false)
    }
  }

  const handleReject = async () => {
    setRejecting(true)
    try {
      const response = await fetch(`/api/quotes/${quoteId}/reject`, {
        method: 'POST',
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to decline quote')
      }

      toast.success('Quote declined. Your coordinator will be notified.')
      router.refresh()
      router.push('/patient/dashboard')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to decline quote'
      toast.error(message)
    } finally {
      setRejecting(false)
    }
  }

  const handlePayDeposit = async () => {
    if (!bookingId) {
      toast.error('No booking linked to this quote yet.')
      return
    }

    setPayLoading(true)
    try {
      const response = await fetch('/api/payments/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          paymentType: 'deposit',
          successUrl: `${globalThis.location.origin}/patient/dashboard?payment=success`,
          cancelUrl: `${globalThis.location.origin}/patient/quotes/${quoteId}`,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Payment initiation failed')
      }

      globalThis.location.href = data.checkoutUrl
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Payment failed'
      toast.error(message)
      setPayLoading(false)
    }
  }

  // Quote pending acceptance
  if (['READY', 'SENT', 'VIEWED'].includes(quoteStatus)) {
    return (
      <div className="flex flex-col gap-4 mt-8 p-6 bg-teal-50 rounded-lg border border-teal-100">
        <h3 className="font-semibold text-teal-900">Ready to Proceed?</h3>
        <p className="text-sm text-teal-700">
          Review the quote carefully. Accepting creates a booking and locks in your
          procedure date. A 30% deposit will be required to confirm.
        </p>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button className="w-full bg-teal-600 hover:bg-teal-700" disabled={accepting}>
              {accepting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Accept Quote
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Quote Acceptance</AlertDialogTitle>
              <AlertDialogDescription>
                You are accepting a quote for{' '}
                <strong>
                  {currency} {totalAmount.toLocaleString()}
                </strong>
                . This will create a booking and your coordinator will contact you
                within 24 hours to confirm your procedure date.
                <br />
                <br />
                <em>
                  Always consult a healthcare professional before finalising treatment
                  decisions.
                </em>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Review Again</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleAccept}
                className="bg-teal-600 hover:bg-teal-700"
              >
                Yes, Accept Quote
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50" disabled={rejecting}>
              {rejecting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <XCircle className="mr-2 h-4 w-4" />}
              Decline Quote
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Decline this Quote?</AlertDialogTitle>
              <AlertDialogDescription>
                Your coordinator will be notified and can send you a revised quote or
                explore alternative hospitals. This cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Keep Reviewing</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleReject}
                className="bg-red-600 hover:bg-red-700"
              >
                Decline Quote
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    )
  }

  // Booking created, deposit pending
  if (bookingId && ['PENDING_PAYMENT', 'PENDING', 'CONFIRMED'].includes(bookingStatus ?? '')) {
    return (
      <div className="flex flex-col gap-4 mt-8 p-6 bg-indigo-50 rounded-lg border border-indigo-100">
        <h3 className="font-semibold text-indigo-900 flex items-center gap-2">
          <CreditCard className="w-5 h-5" /> Secure Your Booking
        </h3>
        <p className="text-sm text-indigo-700">
          Pay the deposit to lock in your procedure date. Your coordinator will send
          your travel itinerary within 48 hours of payment.
        </p>
        <div className="flex justify-between items-center py-2 border-b border-indigo-200">
          <span className="text-sm text-indigo-800">Total Amount</span>
          <span className="font-bold text-lg">
            {currency} {totalAmount.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between items-center py-2">
          <span className="text-sm text-indigo-800">Deposit Due (30%)</span>
          <span className="font-bold text-lg text-indigo-700">
            {currency} {(totalAmount * 0.3).toLocaleString()}
          </span>
        </div>

        <Button
          onClick={handlePayDeposit}
          disabled={payLoading}
          className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700"
        >
          {payLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Pay Deposit with Stripe
        </Button>
        <p className="text-xs text-center text-gray-500 mt-2">
          Secured by Stripe. Your card details are never stored by KmedTour.
        </p>
      </div>
    )
  }

  // Payment confirmed
  if (['DEPOSIT_PAID', 'FULLY_PAID'].includes(bookingStatus ?? '')) {
    return (
      <div className="mt-8 p-6 bg-green-50 rounded-lg border border-green-100 flex items-center gap-4">
        <CheckCircle className="w-8 h-8 text-green-600 shrink-0" />
        <div>
          <h3 className="font-semibold text-green-900">Payment Confirmed</h3>
          <p className="text-sm text-green-700">
            Your deposit has been received. Your coordinator will send your travel
            itinerary within 48 hours.
          </p>
        </div>
      </div>
    )
  }

  // Quote declined or expired
  if (['REJECTED', 'EXPIRED'].includes(quoteStatus)) {
    return (
      <div className="mt-8 p-6 bg-gray-50 rounded-lg border text-center text-gray-500">
        <p className="font-medium">
          This quote has been {quoteStatus === 'REJECTED' ? 'declined' : 'expired'}.
        </p>
        <p className="text-sm mt-1">
          Contact your coordinator for a revised quote.
        </p>
      </div>
    )
  }

  return null
}
