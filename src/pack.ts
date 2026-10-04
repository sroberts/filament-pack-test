/**
 * A Filament transform pack, for a class transform server to load from this
 * repository (spec §5.7). Edit the source, the manifest, and the handler;
 * keep the `pack` export.
 *
 * The server builds this file itself: it installs what package-lock.json
 * pins, with install scripts off, and bundles src/pack.ts into one module.
 * Anything you import is bundled with it and runs on the server as this
 * pack, so depend on as little as you can.
 */

/** Where the data comes from. Students see this beside every result. */
const SOURCE = {
  id: "my-source",
  provider: "Example data",
  license: "free",
  redistributable: true,
  coverage: "One hard-coded answer, for any input",
  freshness: "instant",
  pii_class: "none",
  category: "passive_dns",
} as const;

interface Entity {
  type: string;
  value: string;
}

export const pack = {
  // Lowercase, unique on the server; transform ids start with it by convention.
  id: "pack-test",
  name: "Pack test",
  version: "1.0.0",
  sources: [SOURCE],
  // Provider keys this pack reads, by name. The server hands the pack these
  // and no others; set them on the admin page's Provider keys. A name
  // starting with GITHUB_TOKEN is refused: those hold the server's tokens.
  keys: [],
  create: () => [
    {
      manifest: {
        id: "pack-test.domain_to_ip",
        version: "1.0.0",
        impl: "remote",
        publisher: "your-org",
        name: "Pack test: domain to address",
        description: "Returns a fixed address for any domain, so you can see the round trip before wiring up real data.",
        sources: [SOURCE.id],
        input_types: ["domain-name"],
        input_arity: "one",
        max_input: 10,
        output_types: ["ipv4-addr"],
        link_types: ["resolves_to"],
        // Declare what the call really does (lesson 7.4): passive,
        // third_party, or active. An instructor's review of a new version
        // flags a change here.
        opsec: "passive",
        max_results: 100,
        timeout_s: 30,
        cache_ttl_s: 300,
      },
      handler: async (req: { entities: Entity[] }) => {
        const fetchedAt = new Date().toISOString();
        return {
          entities: req.entities.map((_entity, i) => ({ ref: `e${i}`, type: "ipv4-addr", value: "192.0.2.42", properties: {} })),
          links: req.entities.map((entity, i) => ({
            from: `in:${i}`,
            to: `e${i}`,
            type: "resolves_to",
            source_id: SOURCE.id,
            first_seen: "2026-01-01T00:00:00Z",
            last_seen: fetchedAt,
            source_confidence: "high",
            // The raw upstream answer: without it a link is only "derived".
            evidence: { body: JSON.stringify({ query: entity.value, answers: ["192.0.2.42"] }), media_type: "application/json", fetched_at: fetchedAt },
          })),
          truncated: false,
        };
      },
    },
  ],
};
