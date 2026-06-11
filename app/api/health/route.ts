export function GET() {
  return Response.json({
    ok: true,
    service: "agent-pm-knowledge-workbench",
    checkedAt: new Date().toISOString(),
  });
}
