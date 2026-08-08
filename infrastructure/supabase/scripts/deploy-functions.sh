#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# Kopiert alle Edge Functions aus dem Repo in den Stack und baut den
# main-Router, der /functions/v1/<name> auf den passenden Ordner leitet.
#   bash deploy-functions.sh            # aus dem Repo heraus
# ---------------------------------------------------------------------------
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
SRC="$REPO_ROOT/supabase/functions"
DEST="${STACK_DIR:-/opt/supabase}/volumes/functions"

[ -d "$SRC" ] || { echo "Quelle $SRC nicht gefunden"; exit 1; }
mkdir -p "$DEST"

echo "Kopiere Functions aus $SRC ..."
rsync -a --delete --exclude 'main' "$SRC/" "$DEST/"

echo "Erzeuge main-Router ..."
mkdir -p "$DEST/main"
cat > "$DEST/main/index.ts" <<'TS'
// Router für den self-hosted edge-runtime Container.
// Leitet /functions/v1/<name> an ./<name>/index.ts weiter.
import { serve } from "https://deno.land/std@0.208.0/http/server.ts";

const JWT_SECRET = Deno.env.get("JWT_SECRET")!;
const VERIFY_JWT = Deno.env.get("VERIFY_JWT") === "true";

serve(async (req: Request) => {
  const url = new URL(req.url);
  const name = url.pathname.replace(/^\/+/, "").split("/")[0];

  if (!name || name === "main") {
    return new Response("Not found", { status: 404 });
  }

  const servicePath = `/home/deno/functions/${name}`;
  try {
    await Deno.stat(`${servicePath}/index.ts`);
  } catch {
    return new Response(JSON.stringify({ error: `Function '${name}' not found` }), {
      status: 404,
      headers: { "content-type": "application/json" },
    });
  }

  const worker = await EdgeRuntime.userWorkers.create({
    servicePath,
    memoryLimitMb: 256,
    workerTimeoutMs: 300_000,
    noModuleCache: false,
    envVars: Object.entries(Deno.env.toObject()),
    forceCreate: false,
    ...(VERIFY_JWT ? { jwtSecret: JWT_SECRET, verifyJWT: true } : {}),
  });

  return await worker.fetch(req);
});
TS

echo "Fertig. Container neu starten:"
echo "  cd ${STACK_DIR:-/opt/supabase} && docker compose restart functions"
