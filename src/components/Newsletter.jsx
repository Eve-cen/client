// Newsletter.js
export default function Newsletter() {
  return (
    <section className="bg-gray-900 py-20 flex justify-center">
      <div className="text-center max-w-xl w-full px-8">
        <h2 className="text-2xl font-semibold text-white mb-2">
          Stay Inspired
        </h2>
        <p className="text-gray-300 mb-6">
          Join our newsletter and be the first to discover new spaces, exclusive
          offers, and handpicked spaces worldwide.
        </p>
        <form className="flex gap-2 justify-center">
          <input
            type="email"
            placeholder="Enter your email"
            className="px-4 py-2 rounded bg-gray-800 text-white focus:outline-none"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-black text-white rounded hover:bg-gray-700 cursor-pointer"
          >
            Subscribe &rarr;
          </button>
        </form>
        <p className="text-xs text-gray-400 mt-4">
          By subscribing, you agree to our Privacy Policy and consent to receive
          updates.
        </p>
      </div>
    </section>
  );
}
