import { getContentVersion } from "../../../components/ui/workbench-data";

export default function SettingsPage() {
  const version = getContentVersion();

  return (
    <section className="page-stack" aria-labelledby="settings-title">
      <div className="page-header">
        <span className="section-kicker">Workspace</span>
        <h1 id="settings-title">Settings</h1>
      </div>
      <div className="settings-grid">
        <section className="panel">
          <h2>Account</h2>
          <dl className="settings-list">
            <div>
              <dt>Mode</dt>
              <dd>Primary user</dd>
            </div>
            <div>
              <dt>Session</dt>
              <dd>Backend auth pending</dd>
            </div>
          </dl>
        </section>
        <section className="panel">
          <h2>Content Version</h2>
          <dl className="settings-list">
            <div>
              <dt>Git SHA</dt>
              <dd>{version.gitSha}</dd>
            </div>
            <div>
              <dt>Content hash</dt>
              <dd>{version.contentHash}</dd>
            </div>
            <div>
              <dt>Generated</dt>
              <dd>{version.generatedAt}</dd>
            </div>
            <div>
              <dt>Documents</dt>
              <dd>{version.documentCount}</dd>
            </div>
          </dl>
        </section>
        <section className="panel settings-wide">
          <h2>Backup And Refresh</h2>
          <div className="settings-actions">
            <button type="button">Refresh content</button>
            <button type="button">Export study data</button>
          </div>
          <p className="muted-text">Refresh and backup actions expect authenticated backend handlers from the backend and ops threads.</p>
        </section>
      </div>
    </section>
  );
}
