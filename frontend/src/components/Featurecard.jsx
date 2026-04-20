export default function FeatureCard({ title, text, img }) {
  return (
    
    <div className="bg-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition">
      <img src={img} className="w-full h-48 object-cover" />
      <div className="p-6">
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-gray-600 mb-4">{text}</p>
        <button className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700">Try now</button>
      </div>
    </div>
  )
}
