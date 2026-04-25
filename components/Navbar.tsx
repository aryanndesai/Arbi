export default function Navbar() {
  return (
    <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
      <h1 className="text-xl font-bold text-gray-900">Arbi</h1>
      <div className="flex gap-3">
        <button className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">
          Log in
        </button>
        <button className="px-4 py-2 text-sm bg-black text-white rounded-full hover:bg-gray-800">
          Sign up
        </button>
      </div>
    </nav>
  );
}
