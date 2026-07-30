import { getCrmActor } from "../../../lib/crm/auth.js";
import {
  loadAnalyticsDashboard,
  normalizeAnalyticsFilters,
} from "../../../lib/analytics/dashboard.js";

export const dynamic = "force-dynamic";

const SITE_LABELS = {
  cappuccinobag: "Cappuccino Bag",
  novlane: "Novlane",
};

const integer = new Intl.NumberFormat("zh-CN", { maximumFractionDigits: 0 });
const decimal = new Intl.NumberFormat("zh-CN", { maximumFractionDigits: 1 });

function percent(value) {
  return `${decimal.format(Number(value || 0) * 100)}%`;
}

function chartPath(rows, key, width = 760, height = 220, padding = 18) {
  if (!rows.length) return "";
  const maximum = Math.max(1, ...rows.map((row) => Number(row[key] || 0)));
  return rows.map((row, index) => {
    const x = padding + (rows.length === 1 ? 0 : index / (rows.length - 1) * (width - padding * 2));
    const y = height - padding - Number(row[key] || 0) / maximum * (height - padding * 2);
    return `${index ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
}

function TrendChart({ rows }) {
  if (!rows.length) {
    return <div className="crm-empty crm-analytics-empty">
      <h3>还没有 Google 流量数据</h3>
      <p>管理员完成 Google 授权并执行首次同步后，这里会显示双站点的搜索与访问趋势。</p>
    </div>;
  }
  const clicks = chartPath(rows, "clicks");
  const impressions = chartPath(rows, "impressions");
  const sessions = chartPath(rows, "sessions");
  return <div className="crm-chart">
    <div className="crm-chart-legend">
      <span><i className="clicks" />点击</span>
      <span><i className="impressions" />展示</span>
      <span><i className="sessions" />会话</span>
      <small>三条曲线分别按自身峰值归一化，用于比较趋势而非绝对高度。</small>
    </div>
    <svg viewBox="0 0 760 220" role="img" aria-label="Google 搜索点击、展示与 GA4 会话趋势">
      {[1, 2, 3, 4].map((line) => <line key={line} x1="18" x2="742" y1={line * 44} y2={line * 44} />)}
      <path className="impressions" d={impressions} />
      <path className="sessions" d={sessions} />
      <path className="clicks" d={clicks} />
    </svg>
    <div className="crm-chart-axis">
      <span>{rows[0]?.date}</span>
      <span>{rows.at(-1)?.date}</span>
    </div>
  </div>;
}

function Metric({ label, value, note }) {
  return <div className="crm-metric"><small>{label}</small><strong>{value}</strong><em>{note}</em></div>;
}

function SearchTable({ title, description, rows, type }) {
  return <section className="crm-panel">
    <div className="crm-panel-header"><div><h2>{title}</h2><p>{description}</p></div></div>
    {rows.length ? <div className="crm-table-wrap"><table className="crm-table crm-analytics-table">
      <thead><tr><th>{type === "page" ? "页面" : "搜索词"}</th><th>站点</th><th>点击</th><th>展示</th><th>CTR</th><th>平均排名</th></tr></thead>
      <tbody>{rows.slice(0, 20).map((row) => <tr key={`${row.site}-${row.dimension_type}-${row.dimension_value}`}>
        <td title={row.dimension_value}>{type === "page" ? row.dimension_value.replace(/^https?:\/\/[^/]+/, "") || "/" : row.dimension_value}</td>
        <td><span className={`crm-site ${row.site}`}>{SITE_LABELS[row.site]}</span></td>
        <td>{integer.format(row.clicks)}</td><td>{integer.format(row.impressions)}</td>
        <td>{percent(row.ctr)}</td><td>{decimal.format(row.position)}</td>
      </tr>)}</tbody>
    </table></div> : <div className="crm-empty"><p>同步 GSC 后显示真实{type === "page" ? "页面" : "关键词"}数据，不使用演示流量。</p></div>}
  </section>;
}

function SetupStatus({ configuration }) {
  const rows = Object.entries(SITE_LABELS).map(([site, label]) => ({
    label,
    gsc: configuration.sites[site].searchConsole,
    ga4: configuration.sites[site].ga4,
  }));
  return <section className="crm-panel">
    <div className="crm-panel-header"><div><h2>Google 数据源</h2><p>凭证仅在服务端使用</p></div></div>
    <div className="crm-source-status">
      <div><strong>服务账号</strong><span className={configuration.credentials ? "ready" : "missing"}>{configuration.credentials ? "已配置" : "待配置"}</span></div>
      {rows.map((row) => <div key={row.label}>
        <strong>{row.label}</strong>
        <span className={row.gsc ? "ready" : "missing"}>GSC {row.gsc ? "已连接" : "待连接"}</span>
        <span className={row.ga4 ? "ready" : "missing"}>GA4 {row.ga4 ? "已连接" : "待连接"}</span>
      </div>)}
    </div>
  </section>;
}

export default async function AnalyticsPage({ searchParams }) {
  const params = await searchParams;
  const filters = normalizeAnalyticsFilters(params);
  const actor = await getCrmActor();
  const data = await loadAnalyticsDashboard(filters, actor);
  const summary = data.summary.total;
  const syncMessage = params.sync === "completed"
    ? "Google 数据同步已完成。"
    : params.sync === "failed"
      ? `同步失败：${params.reason || "请检查 Google 授权、Supabase migration 和环境变量。"}`
      : "";
  return <main className="crm-content">
    <div className="crm-heading">
      <div><h1>SEO 与流量分析</h1><p>统一查看 Google Search Console、GA4 与网站询盘转化。</p></div>
      {actor.role === "admin" ? <form action="/api/crm/analytics/sync" method="post">
        <input type="hidden" name="site" value={filters.site} />
        <button className="crm-button primary" type="submit">立即同步 Google 数据</button>
      </form> : null}
    </div>

    <form className="crm-analytics-filter" action="/crm/analytics" method="get">
      <label>站点<select name="site" defaultValue={filters.site}>
        <option value="all">All Sites</option>
        <option value="cappuccinobag">Cappuccino Bag</option>
        <option value="novlane">Novlane</option>
      </select></label>
      <label>时间范围<select name="days" defaultValue={String(filters.days)}>
        <option value="7">最近 7 天</option><option value="28">最近 28 天</option><option value="90">最近 90 天</option>
      </select></label>
      <button className="crm-button" type="submit">应用筛选</button>
      <span>数据区间 {data.range.startDate} — {data.range.endDate}，GSC 使用最终数据。</span>
    </form>

    {syncMessage ? <div className={`crm-alert ${params.sync === "failed" ? "" : "demo"}`}>{syncMessage}</div> : null}
    {!data.configured ? <div className="crm-alert">Analytics migration 尚未执行或数据库不可用：{data.error}</div> : null}

    <section className="crm-metrics crm-analytics-metrics" aria-label="SEO and conversion metrics">
      <Metric label="自然搜索点击" value={integer.format(summary.clicks)} note="Google Search Console" />
      <Metric label="搜索展示" value={integer.format(summary.impressions)} note="Google Search Console" />
      <Metric label="CTR" value={percent(summary.ctr)} note="点击 ÷ 展示" />
      <Metric label="平均排名" value={summary.position ? decimal.format(summary.position) : "—"} note="按展示加权" />
      <Metric label="网站会话" value={integer.format(summary.sessions)} note="Google Analytics 4" />
      <Metric label="询盘 / 转化率" value={`${summary.inquiries} / ${percent(summary.conversion_rate)}`} note="询盘 ÷ GA4 会话" />
    </section>

    <div className="crm-analytics-overview">
      <section className="crm-panel">
        <div className="crm-panel-header"><div><h2>流量与转化趋势</h2><p>点击、展示、会话及每日询盘</p></div></div>
        <TrendChart rows={data.trend} />
        {data.trend.length ? <div className="crm-daily-strip">
          {data.trend.slice(-10).map((row) => <div key={row.date}>
            <span>{row.date.slice(5)}</span><strong>{integer.format(row.clicks)} 点击</strong>
            <small>{integer.format(row.sessions)} 会话 · {row.inquiries} 询盘</small>
          </div>)}
        </div> : null}
      </section>
      <div className="crm-stack">
        <SetupStatus configuration={data.configuration} />
        <section className="crm-panel">
          <div className="crm-panel-header"><div><h2>双站点对比</h2><p>同一时间区间、同一指标口径</p></div></div>
          <div className="crm-site-comparison">
            {Object.entries(SITE_LABELS).map(([site, label]) => {
              const item = data.summary.bySite[site];
              return <div key={site}><strong>{label}</strong><span>{integer.format(item.clicks)} 点击</span>
                <span>{integer.format(item.sessions)} 会话</span><span>{item.inquiries} 询盘 · {percent(item.conversion_rate)}</span></div>;
            })}
          </div>
        </section>
      </div>
    </div>

    <div className="crm-analytics-tables">
      <SearchTable title="高价值搜索词" description="按点击排序，识别高展示低 CTR 与排名机会" rows={data.queries} type="query" />
      <SearchTable title="自然搜索落地页" description="按点击排序，结合询盘页面判断转化价值" rows={data.pages} type="page" />
    </div>

    <section className="crm-panel">
      <div className="crm-panel-header"><div><h2>最近同步</h2><p>每天 08:15 UTC 自动同步，也可由管理员手动触发</p></div></div>
      {data.syncRuns.length ? <div className="crm-sync-list">{data.syncRuns.map((run) => <div key={run.id}>
        <span className={`crm-site ${run.site}`}>{SITE_LABELS[run.site]}</span>
        <strong>{run.status}</strong><span>{run.range_start} — {run.range_end}</span>
        <span>{integer.format(run.row_count)} 行</span><small>{run.error_message || new Date(run.created_at).toLocaleString("zh-CN")}</small>
      </div>)}</div> : <div className="crm-empty"><p>暂无同步记录。完成授权并点击“立即同步 Google 数据”。</p></div>}
    </section>
  </main>;
}
