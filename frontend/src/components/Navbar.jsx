export default function Navbar({ title }) {
  return (
    <div className="w-full bg-blue-600 text-white py-3 px-6 flex items-center justify-between shadow">
      <h1 className="text-2xl font-bold">Attendance System</h1>

      <h2 className="text-lg font-medium">{title}</h2>

      <button
        onClick={() => {
          localStorage.clear();
          window.location.href = "/login";
        }}
        className="bg-red-500 px-4 py-1 rounded hover:bg-red-600 transition"
      >
        Logout
      </button>
    </div>
  );
}
