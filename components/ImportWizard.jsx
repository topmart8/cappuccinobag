"use client";

import { useMemo, useState } from "react";

const fields = [
  ["", "忽略"], ["company", "公司名"], ["name", "联系人"], ["country", "国家"], ["industry", "行业"],
  ["website", "网站"], ["email", "邮箱"], ["phone", "电话"], ["whatsapp", "WhatsApp"],
  ["facebook_url", "Facebook URL"], ["instagram_url", "Instagram URL"], ["linkedin_url", "LinkedIn URL"],
  ["product_keywords", "产品关键词"], ["source_url", "来源 URL"], ["stage", "阶段"], ["tags", "标签"],
  ["notes", "备注"], ["next_follow_up", "下次跟进"],
];

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (character === '"') {
      if (quoted && text[index + 1] === '"') { cell += '"'; index += 1; } else quoted = !quoted;
    } else if (character === "," && !quoted) {
      row.push(cell); cell = "";
    } else if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && text[index + 1] === "\n") index += 1;
      row.push(cell); cell = "";
      if (row.some((item) => item.trim())) rows.push(row);
      row = [];
    } else cell += character;
  }
  row.push(cell);
  if (row.some((item) => item.trim())) rows.push(row);
  return rows;
}

function key(value) {
  return String(value).trim().toLowerCase().replace(/[\s-]+/g, "_");
}

const headerAliases = {
  company_name: "company", business_name: "company", contact_name: "name",
  business_email: "email", email_address: "email", telephone: "phone",
  whatsapp_number: "whatsapp", products: "product_keywords", product: "product_keywords",
  product_keywords: "product_keywords", company_website: "website", source_link: "source_url",
};

export default function ImportWizard() {
  const [filename, setFilename] = useState("");
  const [headers, setHeaders] = useState([]);
  const [rows, setRows] = useState([]);
  const [mapping, setMapping] = useState({});
  const [site, setSite] = useState("cappuccinobag");
  const [previews, setPreviews] = useState([]);
  const [status, setStatus] = useState("");
  const [result, setResult] = useState(null);
  const counts = useMemo(() => ({
    valid: previews.filter((item) => !item.errors.length && !item.duplicate).length,
    duplicates: previews.filter((item) => item.duplicate).length,
    errors: previews.filter((item) => item.errors.length).length,
  }), [previews]);

  async function choose(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return setStatus("CSV 不能超过 5MB。");
    const parsed = parseCsv((await file.text()).replace(/^\uFEFF/, ""));
    const head = parsed.shift()?.map((item) => item.trim()) || [];
    const nextRows = parsed.slice(0, 5000).map((values) => Object.fromEntries(head.map((item, index) => [item, values[index] || ""])));
    const nextMapping = Object.fromEntries(head.map((item) => {
      const normalized = key(item);
      const destination = headerAliases[normalized] || normalized;
      return [item, fields.some(([value]) => value === destination) ? destination : ""];
    }));
    setFilename(file.name); setHeaders(head); setRows(nextRows); setMapping(nextMapping);
    setPreviews([]); setResult(null); setStatus(`已读取 ${nextRows.length} 行，请检查字段映射。`);
  }

  async function request(mode) {
    setStatus(mode === "commit" ? "正在导入，请勿关闭页面…" : "正在检查重复与错误行…");
    const response = await fetch("/api/crm/imports", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode, filename, rows, mapping, site }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) return setStatus(data.message || "处理失败。");
    if (mode === "commit") {
      setResult(data);
      setStatus(`完成：导入 ${data.imported}，重复 ${data.duplicates}，错误 ${data.errors}。`);
    } else {
      setPreviews(data.previews || []);
      setStatus("预览完成。确认无误后再正式导入。");
    }
  }

  return <div>
    <div className="crm-import-drop">
      <h2>选择 CSV 客户文件</h2><p>先预览、映射和去重，确认后才会写入真实客户库。</p>
      <input type="file" accept=".csv,text/csv" onChange={choose} />
    </div>
    {headers.length ? <>
      <div className="crm-form-grid" style={{ marginTop: 16 }}>
        <div className="crm-field"><label>目标站点</label><select value={site} onChange={(event) => setSite(event.target.value)}><option value="cappuccinobag">Cappuccino Bag</option><option value="novlane">Novlane</option></select></div>
        <div className="crm-field"><label>文件</label><input value={`${filename} · ${rows.length} 行`} readOnly /></div>
      </div>
      <div className="crm-import-map">{headers.map((header) => <div className="crm-field" key={header}><label>{header}</label><select aria-label={`${header} 字段映射`} value={mapping[header] || ""} onChange={(event) => setMapping((current) => ({ ...current, [header]: event.target.value }))}>{fields.map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></div>)}</div>
      <div className="crm-actions" style={{ marginTop: 18 }}><button className="crm-button primary" type="button" onClick={() => request("preview")}>预览并检查去重</button>{previews.length ? <button className="crm-button" type="button" disabled={!counts.valid || Boolean(result)} onClick={() => request("commit")}>确认导入 {counts.valid} 条</button> : null}</div>
    </> : null}
    {status ? <p className="crm-form-status" role="status">{status}</p> : null}
    {previews.length ? <div className="crm-table-wrap crm-import-errors" style={{ marginTop: 18 }}><table className="crm-table"><thead><tr><th>行</th><th>公司</th><th>邮箱 / WhatsApp</th><th>评分</th><th>结果</th></tr></thead><tbody>
      {previews.slice(0, 100).map((item) => <tr key={item.row_number}><td>{item.row_number}</td><td>{item.normalized.company || item.normalized.name || "—"}</td><td>{item.normalized.email || item.normalized.whatsapp_phone || item.normalized.website || "—"}</td><td>{item.normalized.score}</td><td>{item.errors.length ? <span className="crm-stage lost">{item.errors.join("；")}</span> : item.duplicate ? <span className="crm-stage">重复：{item.duplicate.customer_number || item.duplicate.company}</span> : <span className="crm-stage won">可导入</span>}</td></tr>)}
    </tbody></table></div> : null}
  </div>;
}
