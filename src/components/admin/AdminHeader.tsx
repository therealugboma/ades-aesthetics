interface AdminHeaderProps {
  title: string;
  adminName?: string;
  adminAvatar?: string;
  onLogout?: () => void;
}

export default function AdminHeader({
  title,
  adminName = "Admin",
  adminAvatar,
  onLogout,
}: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-border-light bg-white px-6 py-4">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-xl font-semibold text-foreground">
          {title}
        </h1>

        <div className="flex items-center gap-4">
          <button className="relative rounded-full p-2 text-muted transition-colors hover:bg-blush-light hover:text-foreground">
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
              />
            </svg>
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-gold" />
          </button>

          <div className="flex items-center gap-3">
            <div className="h-9 w-9 overflow-hidden rounded-full bg-blush">
              {adminAvatar ? (
                <img
                  src={adminAvatar}
                  alt={adminName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm font-medium text-rose-gold-dark">
                  {adminName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-foreground">{adminName}</p>
            </div>
          </div>

          {onLogout && (
            <button
              onClick={onLogout}
              className="rounded-lg px-3 py-1.5 text-sm text-muted transition-colors hover:bg-error/5 hover:text-error"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
