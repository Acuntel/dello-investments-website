"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

type Range = { visits: number; views: number; leads: number };
type NamedCount = { name: string; count: number };
type Stats = {
  analytics: boolean;
  ranges?: { week: Range; month: Range; allTime: Range };
  leads?: { week: number; month: number; allTime: number };
  mobileShare?: number | null;
  topPages?: NamedCount[];
  referrers?: NamedCount[];
  countries?: NamedCount[];
};

function Tile({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-card">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-mist-ink">
        {label}
      </p>
      <p className="mt-3 font-heading text-4xl text-navy">{value}</p>
      {sub ? <p className="mt-1 text-sm text-muted">{sub}</p> : null}
    </div>
  );
}

function Bars({ title, rows }: { title: string; rows: NamedCount[] }) {
  if (!rows.length) return null;
  const max = Math.max(...rows.map((r) => r.count), 1);
  return (
    <section className="rounded-2xl bg-white p-6 shadow-card sm:p-8">
      <h3 className="font-heading text-lg text-navy">{title}</h3>
      <ul className="mt-5 flex flex-col gap-3.5">
        {rows.map((r) => (
          <li key={r.name}>
            <div className="flex items-baseline justify-between gap-4">
              <span className="truncate text-sm text-ink">{r.name}</span>
              <span className="shrink-0 text-sm tabular-nums text-muted">
                {r.count.toLocaleString()}
              </span>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-mist-faint">
              <div
                className="h-full rounded-full bg-mist"
                style={{ width: `${Math.max((r.count / max) * 100, 2)}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

const pct = (leads: number, visits: number) =>
  visits > 0 ? `${Math.round((leads / visits) * 1000) / 10}%` : "—";

export default function AdminStats({ passcode }: { passcode: string }) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    fetch("/api/admin/stats", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ passcode }),
    })
      .then(async (r) => {
        const data = (await r.json()) as Stats;
        if (!r.ok && !data?.leads) throw new Error("failed");
        setStats(data);
        setState("ready");
      })
      .catch(() => setState("error"));
  }, [passcode]);

  if (state === "loading") {
    return (
      <p className="flex items-center gap-2 text-sm text-muted">
        <Loader2 className="h-4 w-4 animate-spin" /> Counting your visitors...
      </p>
    );
  }
  if (state === "error" || !stats) {
    return (
      <p className="max-w-xl text-sm leading-relaxed text-muted">
        The numbers could not be fetched just now. Check your connection and
        open this tab again in a moment.
      </p>
    );
  }

  // Visitor counting is not switched on yet, but enquiries are still recorded,
  // so show the half that is real rather than an empty screen.
  if (!stats.analytics || !stats.ranges) {
    const l = stats.leads ?? { week: 0, month: 0, allTime: 0 };
    return (
      <div className="flex flex-col gap-8">
        <div className="grid gap-5 sm:grid-cols-3">
          <Tile label="Enquiries, last 7 days" value={String(l.week)} />
          <Tile label="Enquiries, last 28 days" value={String(l.month)} />
          <Tile label="Enquiries, all time" value={String(l.allTime)} />
        </div>
        <p className="max-w-xl text-sm leading-relaxed text-muted">
          Visitor counting is not switched on for this site yet. Once it is,
          this page also fills in how many people came by, what they read, and
          how they found you.
        </p>
      </div>
    );
  }

  const { week, month, allTime } = stats.ranges;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="font-heading text-xl text-navy">Last 28 days</h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <Tile
            label="People came by"
            value={month.visits.toLocaleString()}
            sub={`${month.views.toLocaleString()} page views`}
          />
          <Tile
            label="Enquiries"
            value={month.leads.toLocaleString()}
            sub="Form and chat"
          />
          <Tile
            label="Turned into enquiries"
            value={pct(month.leads, month.visits)}
            sub="Enquiries per visit"
          />
          <Tile
            label="On a phone"
            value={
              stats.mobileShare === null || stats.mobileShare === undefined
                ? "Not yet"
                : `${stats.mobileShare}%`
            }
          />
        </div>
      </div>

      <div>
        <h2 className="font-heading text-xl text-navy">
          Last 7 days, and since launch
        </h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <Tile
            label="Last 7 days"
            value={week.visits.toLocaleString()}
            sub={`${week.leads} ${week.leads === 1 ? "enquiry" : "enquiries"} · ${week.views.toLocaleString()} page views`}
          />
          <Tile
            label="All time"
            value={allTime.visits.toLocaleString()}
            sub={`${allTime.leads} ${allTime.leads === 1 ? "enquiry" : "enquiries"} · ${allTime.views.toLocaleString()} page views`}
          />
        </div>
      </div>

      <Bars
        title="What people read most (last 28 days)"
        rows={stats.topPages ?? []}
      />
      <Bars title="How they found you" rows={stats.referrers ?? []} />
      <Bars title="Where they are" rows={stats.countries ?? []} />

      <p className="max-w-2xl text-xs leading-relaxed text-muted">
        These counts are anonymous. The site can see how many visits happened,
        never who made them, and it sets no tracking cookies. Your own visits
        from this browser are not counted.
      </p>
    </div>
  );
}
