import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'

// Rendered for any URL that matches no route. Cloudflare Pages serves the SPA
// shell with a 200 for every path, so RouteMeta marks this page noindex to keep
// it from being treated as a real page.
export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F1F6FD] text-light-ink">
      <Navbar />
      <main className="mx-auto flex max-w-[640px] flex-col items-center px-[6vw] py-24 text-center">
        <div className="mb-3 font-poppins text-[64px] font-extrabold leading-none text-primary">404</div>
        <h1 className="mb-3 font-poppins text-[26px] font-extrabold">Page not found</h1>
        <p className="mb-7 text-[15px] text-light-inkSoft">
          The page you're looking for doesn't exist or may have moved.
        </p>
        <a href="/" className="rounded-pill bg-primary px-8 py-3.5 text-[15px] font-bold text-white">
          Back to home
        </a>
      </main>
      <Footer />
    </div>
  )
}
