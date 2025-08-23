
export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 py-8 sm:flex-row">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Project Management Institute, Inc. All Rights Reserved.
        </p>
        <div className="flex items-center gap-4">
          <a href="https://www.pmi.org/privacy" target="_blank" rel="noreferrer" className="text-sm text-muted-foreground hover:underline">
            Privacy Policy
          </a>
          <a href="https://www.pmi.org/terms" target="_blank" rel="noreferrer" className="text-sm text-muted-foreground hover:underline">
            Terms of Use
          </a>
        </div>
      </div>
    </footer>
  );
}
