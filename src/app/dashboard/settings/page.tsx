export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="mt-1 ">Configure your preferences</p>
      </div>

      <div className="space-y-6">
        {/* Appearance */}
        <div className="rounded-xl bg-card p-6">
          <h2 className="text-lg font-semibold text-foreground">Appearance</h2>
          <p className="mt-1 text-sm ">Customize how the app looks</p>

          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Dark Mode</p>
                <p className="text-sm ">Use dark theme</p>
              </div>
              <button className="relative h-6 w-11 rounded-full bg-primary">
                <span className="absolute right-1 top-1 h-4 w-4 rounded-full bg-card-foreground transition-transform" />
              </button>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="rounded-xl bg-card p-6">
          <h2 className="text-lg font-semibold text-foreground">Notifications</h2>
          <p className="mt-1 text-sm ">Manage your notification preferences</p>

          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Email Notifications</p>
                <p className="text-sm ">Receive email updates</p>
              </div>
              <button className="relative h-6 w-11 rounded-full bg-muted">
                <span className="absolute left-1 top-1 h-4 w-4 rounded-full bg-card-foreground transition-transform" />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Push Notifications</p>
                <p className="text-sm ">Receive push notifications</p>
              </div>
              <button className="relative h-6 w-11 rounded-full bg-primary">
                <span className="absolute right-1 top-1 h-4 w-4 rounded-full bg-card-foreground transition-transform" />
              </button>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="rounded-xl border border-destructive/20 bg-card p-6">
          <h2 className="text-lg font-semibold text-destructive">Danger Zone</h2>
          <p className="mt-1 text-sm ">Irreversible and destructive actions</p>

          <div className="mt-4">
            <button className="rounded-lg border border-destructive px-4 py-2 text-destructive transition-colors hover:bg-destructive hover:text-destructive-foreground">
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
