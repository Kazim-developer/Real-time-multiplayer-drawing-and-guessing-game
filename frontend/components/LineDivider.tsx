export default function LineDivider() {
  return (
    <div className="flex items-center my-[1.5rem]">
      <div className="flex-grow h-px bg-gray-300"></div>
      <span className="mx-4 text-gray-500 text-sm">or</span>
      <div className="flex-grow h-px bg-gray-300"></div>
    </div>
  );
}
