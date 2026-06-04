import { runProductDiscoveryAction } from "../actions";

export default function DiscoveryPage() {
  return (
    <main className="space-y-5">
      <section className="card">
        <h2 className="text-xl font-bold">Product discovery sandbox</h2>
        <p className="mt-2 text-sm text-gray-700">
          Ejecuta discovery persistente con conectores seguros `mock`, `manual` y `csv-json`. Cada resultado queda en revision humana obligatoria.
        </p>
        <form action={runProductDiscoveryAction} className="mt-4 grid gap-3 text-sm md:grid-cols-2">
          <label>Conector<select className="mt-1 w-full rounded border p-2" name="connectorId" defaultValue="mock"><option value="mock">Mock Connector</option><option value="manual">Manual</option><option value="csv-json">CSV/JSON Import</option><option value="cj">CJdropshipping (needs_credentials)</option></select></label>
          <label>Mercado<select className="mt-1 w-full rounded border p-2" name="targetMarket" defaultValue="Uruguay"><option>Uruguay</option><option>LATAM</option><option>global</option></select></label>
          <label>Categoria<input className="mt-1 w-full rounded border p-2" name="category" placeholder="Opcional" /></label>
          <label>Palabra clave<input className="mt-1 w-full rounded border p-2" name="keyword" placeholder="Opcional" /></label>
          <label>Margen minimo<input className="mt-1 w-full rounded border p-2" name="minimumMarginPercent" type="number" defaultValue="25" /></label>
          <label>Envio maximo dias<input className="mt-1 w-full rounded border p-2" name="maximumShippingDays" type="number" defaultValue="30" /></label>
          <label>Formato payload<select className="mt-1 w-full rounded border p-2" name="payloadFormat" defaultValue="json"><option value="json">JSON</option><option value="csv">CSV</option></select></label>
          <label>Resultados maximos<input className="mt-1 w-full rounded border p-2" name="maximumResults" type="number" defaultValue="10" /></label>
          <label>Titulo manual<input className="mt-1 w-full rounded border p-2" name="title" placeholder="Usado por connector manual" /></label>
          <label>Proveedor/supplier<input className="mt-1 w-full rounded border p-2" name="supplierName" placeholder="Opcional" /></label>
          <label>URL origen<input className="mt-1 w-full rounded border p-2" name="sourceUrl" placeholder="https://..." type="url" /></label>
          <label>Imagen URL<input className="mt-1 w-full rounded border p-2" name="imageUrl" placeholder="https://..." type="url" /></label>
          <label>Precio compra<input className="mt-1 w-full rounded border p-2" min="0" name="buyPrice" step="0.01" type="number" /></label>
          <label>Envio<input className="mt-1 w-full rounded border p-2" defaultValue="0" min="0" name="shippingCost" step="0.01" type="number" /></label>
          <label>Stock<input className="mt-1 w-full rounded border p-2" defaultValue="0" min="0" name="inventoryTotal" type="number" /></label>
          <label>Stock verificado<input className="mt-1 w-full rounded border p-2" defaultValue="0" min="0" name="verifiedInventory" type="number" /></label>
          <label>Rating<input className="mt-1 w-full rounded border p-2" max="5" min="0" name="rating" step="0.1" type="number" /></label>
          <label>Derechos de imagen<select className="mt-1 w-full rounded border p-2" name="imageRightsStatus" defaultValue="unknown"><option value="unknown">unknown</option><option value="allowed">allowed</option><option value="restricted">restricted</option></select></label>
          <label>Derechos de reventa<select className="mt-1 w-full rounded border p-2" name="resaleRightsStatus" defaultValue="unknown"><option value="unknown">unknown</option><option value="allowed">allowed</option><option value="restricted">restricted</option></select></label>
          <label className="md:col-span-2">Descripcion / notas<textarea className="mt-1 w-full rounded border p-2" name="description" placeholder="Usado por connector manual o como fallback para filas CSV/JSON." rows={4} /></label>
          <label className="md:col-span-2">Payload CSV/JSON<textarea className="mt-1 w-full rounded border p-2 font-mono" name="payloadText" placeholder='[{"title":"Set beauty","price":8,"shipping":2,"stock":12}]' rows={7} /></label>
          <button className="btn self-end" type="submit">Run Discovery</button>
        </form>
      </section>
      <section className="card">
        <h2 className="text-xl font-bold">Filtros preparados</h2>
        <p className="mt-2 text-sm">
          El servicio acepta categoria, palabra clave, margen minimo, costo maximo proveedor, mercado objetivo, envio maximo, limite de resultados y payload controlado para connectors manual/csv-json.
        </p>
        <p className="mt-3 text-sm font-bold">Conectores reales siguen bloqueados hasta cargar credenciales aprobadas de forma segura.</p>
      </section>
    </main>
  );
}
