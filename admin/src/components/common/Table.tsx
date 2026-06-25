import type { ReactNode } from "react";

export function Table({ headers, children }: { headers: string[]; children: ReactNode }) {
  return (
    <div className="table-wrap">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead className="bg-surface-soft text-xs uppercase tracking-widest text-muted">
          <tr>
            {headers.map((header, index) => (
              <th
                key={header}
                className={`px-4 py-3 ${index === 0 ? "rounded-l-lg" : ""} ${index === headers.length - 1 ? "rounded-r-lg" : ""}`}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export function Cell({ children, strong }: { children: ReactNode; strong?: boolean }) {
  return <td className={`max-w-72 break-words px-4 py-4 align-top ${strong ? "font-bold text-primary" : "text-muted"}`}>{children}</td>;
}
