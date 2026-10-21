export default function RaportViewer({ url, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center">
      <div className="bg-white p-4 rounded-lg w-3/4 h-3/4 flex flex-col">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-bold">Preview Raport</h3>
          <button onClick={onClose} className="text-red-500 font-bold">X Tutup</button>
        </div>
        <iframe src={url} className="w-full flex-grow border rounded"></iframe>
      </div>
    </div>
  );
}
