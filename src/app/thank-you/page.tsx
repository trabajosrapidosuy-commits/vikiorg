import Link from 'next/link'

export default function ThankYou() {
  return (
    <div className="flex items-center justify-center min-h-screen py-12">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center space-y-6">
        <div className="text-6xl">🎉</div>
        <h1 className="text-3xl font-bold">Thank You!</h1>
        
        <div className="bg-green-50 p-4 rounded-lg text-green-800">
          <p className="font-semibold mb-2">Order Received</p>
          <p className="text-sm">
            We've received your order and our team will contact you via WhatsApp within the next 24 hours.
          </p>
        </div>

        <div className="space-y-3 text-left bg-blue-50 p-4 rounded">
          <p className="font-semibold text-blue-900">📋 What's next?</p>
          <ul className="text-sm text-blue-800 space-y-2">
            <li>✓ Check your email for order confirmation</li>
            <li>✓ Wait for WhatsApp contact from our team</li>
            <li>✓ Discuss shipping and payment details</li>
            <li>✓ Track your order status</li>
          </ul>
        </div>

        <div className="space-y-3">
          <Link 
            href="/products"
            className="block bg-victoriosa-primary text-white py-3 rounded-lg font-semibold hover:bg-victoriosa-secondary transition"
          >
            Continue Shopping
          </Link>
          <Link 
            href="/"
            className="block border border-gray-300 py-3 rounded-lg font-semibold hover:bg-gray-50 transition"
          >
            Back to Home
          </Link>
        </div>

        <p className="text-xs text-gray-600">
          💬 Make sure you have WhatsApp enabled for your phone number to receive order updates.
        </p>
      </div>
    </div>
  )
}
