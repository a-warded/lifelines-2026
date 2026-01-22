export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="mt-1 text-zinc-400">Configure your preferences</p>
      </div>

      <div className="space-y-6">
        {/* Appearance */}
        <div className="rounded-xl bg-zinc-900 p-6">
          <h2 className="text-lg font-semibold text-white">Appearance</h2>
          <p className="mt-1 text-sm text-zinc-400">
            Customize how the app looks
          </p>

          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-white">Dark Mode</p>
                <p className="text-sm text-zinc-400">Use dark theme</p>
              </div>
              <button className="relative h-6 w-11 rounded-full bg-blue-600">
                <span className="absolute right-1 top-1 h-4 w-4 rounded-full bg-white transition-transform" />
              </button>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="rounded-xl bg-zinc-900 p-6">
          <h2 className="text-lg font-semibold text-white">Notifications</h2>
          <p className="mt-1 text-sm text-zinc-400">
            Manage your notification preferences
          </p>

          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-white">Email Notifications</p>
                <p className="text-sm text-zinc-400">
                  Receive email updates
                </p>
              </div>
              <button className="relative h-6 w-11 rounded-full bg-zinc-700">
                <span className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-transform" />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-white">Push Notifications</p>
                <p className="text-sm text-zinc-400">
                  Receive push notifications
                </p>
              </div>
              <button className="relative h-6 w-11 rounded-full bg-blue-600">
                <span className="absolute right-1 top-1 h-4 w-4 rounded-full bg-white transition-transform" />
              </button>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="rounded-xl border border-red-500/20 bg-zinc-900 p-6">
          <h2 className="text-lg font-semibold text-red-500">Danger Zone</h2>
          <p className="mt-1 text-sm text-zinc-400">
            Irreversible and destructive actions
          </p>

          <div className="mt-4">
            <button className="rounded-lg border border-red-500 px-4 py-2 text-red-500 transition-colors hover:bg-red-500 hover:text-white">
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
