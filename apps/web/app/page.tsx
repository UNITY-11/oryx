export default function HomePage() {
  return (
    <main className="container mx-auto p-8">
      <div className="flex flex-col items-center justify-center space-y-12 py-24 text-center">
        {/* Brand Header */}
        <div className="space-y-4">
          <h1 className="font-serif text-5xl font-light tracking-widest text-primary sm:text-7xl">
            ORYX
          </h1>
          <p className="tracking-[0.3em] text-text-secondary">
            BEAUTY SPA & SALON
          </p>
        </div>

        {/* Design System Preview */}
        <div className="w-full max-w-4xl space-y-12 rounded-soft bg-surface p-12 shadow-spa">
          
          <section className="space-y-6 text-left">
            <h2 className="font-serif text-3xl text-primary-dark">Typography</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-serif text-xl">Cinzel (Serif)</h3>
                <p className="text-sm text-text-secondary">Used for headings, logos, and elegant accents.</p>
              </div>
              <div>
                <h3 className="font-sans text-xl font-medium">Inter (Sans-Serif)</h3>
                <p className="font-sans text-sm text-text-secondary">Used for body copy, buttons, and readable interface elements.</p>
              </div>
            </div>
          </section>

          <section className="space-y-6 text-left">
            <h2 className="font-serif text-3xl text-primary-dark">Colors</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="space-y-2">
                <div className="h-16 w-full rounded-soft bg-background border border-primary/20"></div>
                <p className="text-sm font-medium">Background</p>
              </div>
              <div className="space-y-2">
                <div className="h-16 w-full rounded-soft bg-surface border border-primary/20"></div>
                <p className="text-sm font-medium">Surface</p>
              </div>
              <div className="space-y-2">
                <div className="h-16 w-full rounded-soft bg-primary"></div>
                <p className="text-sm font-medium">Primary</p>
              </div>
              <div className="space-y-2">
                <div className="h-16 w-full rounded-soft bg-primary-dark"></div>
                <p className="text-sm font-medium">Primary Dark</p>
              </div>
            </div>
          </section>

          <section className="space-y-6 text-left">
            <h2 className="font-serif text-3xl text-primary-dark">UI Elements</h2>
            <div className="flex flex-wrap gap-4">
              <button className="rounded-soft bg-primary px-8 py-3 font-sans font-medium text-surface transition-colors hover:bg-primary-dark">
                Book Appointment
              </button>
              <button className="rounded-soft border-2 border-primary bg-transparent px-8 py-3 font-sans font-medium text-primary transition-colors hover:bg-primary hover:text-surface">
                Our Services
              </button>
            </div>
          </section>

        </div>
      </div>
    </main>
  );
}
