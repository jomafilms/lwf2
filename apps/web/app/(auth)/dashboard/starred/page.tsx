export default function StarredListsPage() {
  return (
    <div className="p-6">
      <div className="max-w-4xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Starred Lists</h1>
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <div className="text-gray-400 mb-3">⭐</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No starred lists yet</h3>
          <p className="text-gray-500">
            Star your favorite plant lists to see them here for quick access.
          </p>
        </div>
      </div>
    </div>
  );
}