export function BookingFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-subtle bg-surface-page">
      <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between px-600 py-400 md:px-1200 md:py-600">
        <p className="font-sans text-caption text-muted">
          © {year} Datil. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
