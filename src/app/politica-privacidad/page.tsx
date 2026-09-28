export const metadata = { title: "Política de privacidad" };

export default function PoliticaPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold text-zinc-900">Política de privacidad</h1>
      <p className="mt-4 text-sm leading-relaxed text-zinc-600">
        Este sitio es una demostración académica. Los datos que ingreses en formularios y
        pedidos se almacenan en una base SQLite local para fines de prueba. En un entorno
        real se aplicaría la normativa colombiana de protección de datos personales (Ley
        1581 de 2012 y decretos reglamentarios), consentimiento informado y medidas de
        seguridad (HTTPS, minimización de datos, etc.).
      </p>
    </div>
  );
}
