export default function AdminOrders() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Orders Management</h1>

      <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg">
        <p className="text-yellow-800">
          ⏳ <strong>Coming in Prompt 08:</strong> Full order management system with order tracking, 
          customer communication, and supplier notifications.
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Order Statistics (Placeholder)</h2>
        <div className="grid md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded">
            <p className="text-3xl font-bold text-blue-600">0</p>
            <p className="text-gray-600">Total Orders</p>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded">
            <p className="text-3xl font-bold text-yellow-600">0</p>
            <p className="text-gray-600">Pending</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded">
            <p className="text-3xl font-bold text-green-600">0</p>
            <p className="text-gray-600">Shipped</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded">
            <p className="text-3xl font-bold text-purple-600">$0</p>
            <p className="text-gray-600">Revenue</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Roadmap</h2>
        <ul className="space-y-2 text-gray-700">
          <li>✅ Product CRUD (Prompt 04)</li>
          <li>✅ CSV/JSON import (Prompt 04)</li>
          <li>🔄 Storefront display (Prompt 05)</li>
          <li>🔄 Pricing & margins (Prompt 06)</li>
          <li>🔄 WhatsApp integration (Prompt 07)</li>
          <li>⏳ Order management (Prompt 08)</li>
          <li>⏳ Analytics (Prompt 09)</li>
          <li>⏳ And more...</li>
        </ul>
      </div>
    </div>
  )
}
