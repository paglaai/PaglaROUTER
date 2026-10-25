/* PaglaROUTER live telemetry dashboard — fetches /health and renders provider state. */
(() => {
  const grid = document.getElementById("providers");
  const status = document.getElementById("gw-status");
  const updated = document.getElementById("updated");

  function setStatus(ok) {
    status.textContent = ok ? "ONLINE" : "OFFLINE";
    status.className = "badge " + (ok ? "ok" : "down");
  }

  function render(catalog, health) {
    if (!catalog || !Array.isArray(catalog.providers)) return;
    grid.innerHTML = "";
    const pct = (v, max) => Math.max(0, Math.min(100, Math.round((v / Math.max(1, max)) * 100)));

    for (const p of catalog.providers) {
      const q = p.quota || {};
      const live = health?.ok === true;
      const card = document.createElement("div");
      card.className = "card";

      const title = document.createElement("h3");
      const label = document.createElement("span");
      label.textContent = p.label || p.id || "Provider";
      const state = document.createElement("span");
      state.className = live ? "live" : "dead";
      state.textContent = live ? "LIVE" : "DOWN";
      title.append(label, state);
      card.appendChild(title);

      const statusLine = document.createElement("div");
      statusLine.className = "status";
      statusLine.textContent = `model: ${p.default_model || "—"}  ·  reset: ${q.reset || "—"}  ·  configured: ${health?.configured ? "yes" : "no"}`;
      card.appendChild(statusLine);

      const rows = [
        ["RPM", p.rpmRemaining ?? q.rpm ?? 0, q.rpm ?? 1],
        ["TPM", p.tpmRemaining ?? q.tpm ?? 0, q.tpm ?? 1],
        ["RPD", p.rpdRemaining ?? q.rpd ?? 0, q.rpd ?? 1],
      ];
      for (const [label, used, max] of rows) {
        const w = pct(max - Math.min(used, max), max);
        const meter = document.createElement("div");
        meter.innerHTML = `<div style="width:${w}%"></div>`;
        meter.className = "meter";
        const row = document.createElement("div");
        row.className = "row";
        row.innerHTML = `<span>${label}</span><b>${used} / ${max}</b>`;
        card.appendChild(row);
        card.appendChild(meter);
      }

      const models = document.createElement("div");
      models.className = "mono";
      models.textContent = p.models ? p.models.slice(0, 4).join(", ") : "";
      card.appendChild(models);

      grid.appendChild(card);
    }
  }

  async function poll() {
    try {
      const [healthRes, catalogRes] = await Promise.all([
        fetch("/health", { headers: { Accept: "application/json" } }),
        fetch("/", { headers: { Accept: "application/json" } }),
      ]);
      if (!healthRes.ok || !catalogRes.ok) throw new Error("gateway check failed");
      const [health, catalog] = await Promise.all([healthRes.json(), catalogRes.json()]);
      setStatus(health.ok === true);
      render(catalog, health);
    } catch {
      setStatus(false);
      grid.innerHTML = `<div class="card mono">Gateway unreachable — is the Worker deployed to router.paglaai.space?</div>`;
    }
    if (updated) updated.textContent = new Date().toLocaleTimeString();
  }

  poll();
  setInterval(poll, 10000);
})();
