export default function StatCard({ title, value, color, icon }) {
  return (
    <div className={`${color} text-white p-6 rounded-lg shadow-md flex justify-between items-center transition-transform hover:-translate-y-1`}>
      <div>
        <h6 className="uppercase text-sm font-semibold opacity-90">{title}</h6>
        <h2 className="text-3xl font-bold mt-1">{value}</h2>
      </div>
      <div className="text-4xl opacity-80">
        <i className={`fas fa-${icon}`}></i>
      </div>
    </div>
  );
}
