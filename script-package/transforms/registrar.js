// A script transform (spec §5.2): it runs in Filament's sandbox, reaches
// only the hosts its manifest declares, and builds results through ctx.
export const id = "example.rdap.registrar";

/** The registrar entity in an RDAP domain record, if there is one. */
function registrarOf(record) {
  for (const e of record.entities ?? []) {
    if (!(e.roles ?? []).includes("registrar")) continue;
    const name = (e.vcardArray?.[1] ?? []).find((field) => field[0] === "fn")?.[3];
    const ianaId = (e.publicIds ?? []).find((p) => p.type === "IANA Registrar ID")?.identifier;
    if (name) return { name, ianaId };
  }
  return undefined;
}

export default async function run(input, ctx) {
  const out = ctx.results();
  for (const domain of input.entities) {
    const tld = domain.value.split(".").pop();
    if (tld !== "com" && tld !== "net") {
      ctx.message("info", `${domain.value}: this example asks Verisign, which holds only .com and .net`);
      continue;
    }
    const res = await ctx.http.get(`https://rdap.verisign.com/${tld}/v1/domain/${encodeURIComponent(domain.value)}`, {
      headers: { accept: "application/rdap+json" },
    });
    if (res.status === 404) {
      ctx.message("warn", `no RDAP record for ${domain.value}`);
      continue;
    }
    if (!res.ok) {
      ctx.message("error", `RDAP answered ${res.status} for ${domain.value}`);
      continue;
    }
    const record = res.json();
    const registrar = registrarOf(record);
    if (!registrar) continue;
    const registered = (record.events ?? []).find((e) => e.eventAction === "registration")?.eventDate;
    const org = out.entity("organization", registrar.name, registrar.ianaId ? { registry_id: `IANA:${registrar.ianaId}` } : {});
    // The response just read is stored as this link's evidence by the host.
    out.link(domain, org, "registered_by", { first_seen: registered, last_seen: ctx.now(), source_confidence: "high" });
  }
  return out;
}
