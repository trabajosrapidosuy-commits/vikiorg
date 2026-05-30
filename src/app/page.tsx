import Link from 'next/link'

export default function Home() {
  return (
    <div className="space-y-8 py-12">
      <section className="text-center">
        <h2 className="text-4xl font-bold mb-4">Welcome to Victoriosa</h2>
        <p className="text-xl text-gray-600 mb-6">
          Premium beauty and aesthetic products handpicked for you
        </p>
        <Link 
          href="/products"
          className="inline-block bg-victoriosa-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-victoriosa-secondary transition"
        >
          Shop Now
        </Link>
      </section>

      <section className="grid md:grid-cols-3 gap-6 mt-12">
        <div className="bg-victoriosa-light p-6 rounded-lg">
          <h3 className="font-bold text-lg mb-2">✨ Premium Selection</h3>
          <p className="text-gray-700">Curated beauty products from trusted suppliers in Uruguay</p>
        </div>
        <div className="bg-victoriosa-light p-6 rounded-lg">
          <h3 className="font-bold text-lg mb-2">🚚 Fast Delivery</h3>
          <p className="text-gray-700">Quick shipping within Uruguay with reliable partners</p>
        </div>
        <div className="bg-victoriosa-light p-6 rounded-lg">
          <h3 className="font-bold text-lg mb-2">💬 WhatsApp Support</h3>
          <p className="text-gray-700">Direct support and personalized consultations</p>
        </div>
      </section>

      <section className="grid md:grid-cols-2 gap-6 mt-12">
        <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
          <h3 className="font-bold text-lg mb-3 text-blue-900">🛒 Storefront (Live)</h3>
          <p className="text-gray-700 mb-4">Browse our complete beauty collection with detailed product information</p>
          <Link href="/products" className="text-blue-600 hover:underline font-semibold">
            View Products →
          </Link>
        </div>
        <div className="bg-purple-50 border border-purple-200 p-6 rounded-lg">
          <h3 className="font-bold text-lg mb-3 text-purple-900">📦 Admin Dashboard</h3>
          <p className="text-gray-700 mb-4">Manage products, imports, and orders (admin access only)</p>
          <Link href="/admin" className="text-purple-600 hover:underline font-semibold">
            Admin Panel →
          </Link>
        </div>
      </section>

      <section className="text-center mt-12 p-8 bg-green-50 border border-green-200 rounded-lg">
        <h3 className="text-2xl font-bold mb-4">🚀 MVP Features Live</h3>
        <div className="grid md:grid-cols-4 gap-4 text-sm">
          <div>✅ Product Catalog</div>
          <div>✅ Admin CRUD</div>
          <div>✅ CSV Imports</div>
          <div>✅ Shopping Cart</div>
        </div>
        <p className="text-gray-600 mt-4 text-sm">Prompts 04-05 complete. Pricing, WhatsApp, and Orders coming next.</p>
      </section>
    </div>
  )
}
