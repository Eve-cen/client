export default function Footer() {
  return (
    <footer className="bg-gray-50 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-wrap justify-between items-start">
        {/* Company Brand */}
        <div className="mb-6">
          {/* <div className="font-bold text-lg mb-2">Evecen</div> */}
          <img src="/logo-blue.png" className="w-[10rem]" />
          <p className="text-gray-500 text-sm max-w-xs my-3">
            Discover the worlds most exceptional commercial spaces, from offices
            and studios to venues and landmark locations.
          </p>
          <div className="flex space-x-3 text-gray-500">
            <a href="#">
              <i className="fab fa-facebook-square"></i>
            </a>
            <a href="#">
              <i className="fab fa-instagram"></i>
            </a>
            <a href="#">
              <i className="fab fa-twitter"></i>
            </a>
          </div>
        </div>
        {/* Footer Links */}
        <div className="flex flex-wrap gap-12">
          <div className="pr-20">
            <div className="font-semibold mb-2">Company</div>
            <ul className="text-gray-500 text-sm space-y-1">
              <li>
                <a href="#">About</a>
              </li>
              <li>
                <a href="#">Careers</a>
              </li>
              <li>
                <a href="#">Press</a>
              </li>
              <li>
                <a href="/blogs">Blog</a>
              </li>
              <li>
                <a href="#">Partners</a>
              </li>
            </ul>
          </div>
          <div className="pr-20">
            <div className="font-semibold mb-2">Support</div>
            <ul className="text-gray-500 text-sm space-y-1">
              <li>
                <a href="#">Help Center</a>
              </li>
              <li>
                <a href="#">Safety Information</a>
              </li>
              <li>
                <a href="#">Cancellation Options</a>
              </li>
              <li>
                <a href="#">Contact Us</a>
              </li>
              <li>
                <a href="#">Accessibility</a>
              </li>
            </ul>
          </div>
          <div className="pr-20">
            <div className="font-semibold mb-2">Support</div>
            <ul className="text-gray-500 text-sm space-y-1">
              <li>
                <a href="#">Help Center</a>
              </li>
              <li>
                <a href="#">Safety Information</a>
              </li>
              <li>
                <a href="#">Cancellation Options</a>
              </li>
              <li>
                <a href="#">Contact Us</a>
              </li>
              <li>
                <a href="#">Accessibility</a>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center border-t border-gray-200 mt-8 pt-6 text-gray-400 text-sm">
        <span>© 2025 VenCome. All rights reserved.</span>
        <div className="space-x-6">
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
          <a href="#">Sitemap</a>
        </div>
      </div>
    </footer>
  );
}
