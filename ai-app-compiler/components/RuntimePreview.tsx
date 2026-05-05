import type { RuntimeSimulation } from "@/lib/types";

interface RuntimePreviewProps {
  runtime: RuntimeSimulation;
}

export function RuntimePreview({ runtime }: RuntimePreviewProps) {
  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line bg-white p-5 shadow-sm">
        <div>
          <h2 className="text-lg font-semibold text-ink">Config Runtime Preview</h2>
          <p className="text-sm text-slate-600">Execution map generated from the validated configuration.</p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-sm font-semibold ${
            runtime.executable ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}
        >
          {runtime.executable ? "Executable" : "Blocked"}
        </span>
      </div>

      {runtime.issues.length > 0 ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {runtime.issues.join(" ")}
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        {runtime.pages.map((page) => (
          <article key={page.route} className="rounded-lg border border-line bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-ink">{page.title}</h3>
                <p className="text-sm text-slate-600">
                  {page.route} - {page.layout.type} layout
                </p>
              </div>
              <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                {page.connectedApis.length} API
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {page.components.map((component) => (
                <span key={component} className="rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-800">
                  {component}
                </span>
              ))}
            </div>
            <div className="mt-3 text-xs text-slate-600">
              <span className="font-semibold text-slate-700">Regions:</span> {page.layout.regions.join(", ")}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {page.connectedApis.length > 0 ? (
                page.connectedApis.map((api) => (
                  <span key={api} className="rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-800">
                    {api}
                  </span>
                ))
              ) : (
                <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                  no API
                </span>
              )}
            </div>
          </article>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <div className="overflow-hidden rounded-lg border border-line bg-white shadow-sm">
          <div className="border-b border-line p-4">
            <h3 className="font-semibold text-ink">API Map</h3>
          </div>
          <div className="overflow-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-mist text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Method</th>
                  <th className="px-4 py-3">Path</th>
                  <th className="px-4 py-3">Table</th>
                  <th className="px-4 py-3">Validation</th>
                  <th className="px-4 py-3">Executable</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {runtime.apiMap.map((api) => (
                  <tr key={`${api.method}-${api.path}`}>
                    <td className="px-4 py-3 font-semibold text-ink">{api.method}</td>
                    <td className="px-4 py-3 text-slate-700">{api.path}</td>
                    <td className="px-4 py-3 text-slate-700">{api.table}</td>
                    <td className="px-4 py-3 text-slate-700">
                      req {api.requestFields.length} / res {api.responseFields.length}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-semibold ${
                          api.executable ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}
                      >
                        {api.executable ? "yes" : "no"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-line bg-white shadow-sm">
          <div className="border-b border-line p-4">
            <h3 className="font-semibold text-ink">Database Map</h3>
          </div>
          <div className="divide-y divide-line">
            {runtime.databaseMap.map((table) => (
              <div key={table.table} className="p-4">
                <p className="font-semibold text-ink">{table.table}</p>
                <p className="mt-1 text-sm text-slate-600">{table.fields.join(", ")}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-line bg-white shadow-sm">
        <div className="border-b border-line p-4">
          <h3 className="font-semibold text-ink">Relation Map</h3>
        </div>
        <div className="overflow-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-mist text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">From</th>
                <th className="px-4 py-3">To</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Executable</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {runtime.relationMap.length > 0 ? (
                runtime.relationMap.map((relation) => (
                  <tr key={`${relation.from}-${relation.to}`}>
                    <td className="px-4 py-3 text-slate-700">{relation.from}</td>
                    <td className="px-4 py-3 text-slate-700">{relation.to}</td>
                    <td className="px-4 py-3 text-slate-700">{relation.type}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-semibold ${
                          relation.executable ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}
                      >
                        {relation.executable ? "yes" : "no"}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-4 py-3 text-slate-600" colSpan={4}>
                    No table relations inferred for this prompt.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-line bg-white shadow-sm">
        <div className="border-b border-line p-4">
          <h3 className="font-semibold text-ink">Permission Matrix</h3>
        </div>
        <div className="overflow-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-mist text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Pages</th>
                <th className="px-4 py-3">Endpoints</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {runtime.permissionMatrix.map((row) => (
                <tr key={row.role}>
                  <td className="px-4 py-3 font-semibold text-ink">{row.role}</td>
                  <td className="px-4 py-3 text-slate-700">{row.pages.join(", ")}</td>
                  <td className="px-4 py-3 text-slate-700">{row.endpoints.join(", ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
