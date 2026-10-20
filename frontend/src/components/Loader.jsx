const Loader = () => {
  return (
    <div
      role="status"
      className="mx-auto block h-[100px] w-[100px] animate-spin rounded-full border-8 border-gray-300 border-t-blue-600"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default Loader;