export const WhyChooseUs = () => (
  <section className="relative py-12 bg-white text-black overflow-hidden">
    {/* Background blobs */}
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute -top-16 -left-10 w-64 h-64 bg-red-300/10 rounded-full filter blur-2xl"></div>
      <div className="absolute bottom-0 -right-10 w-64 h-64 bg-orange-300/10 rounded-full filter blur-2xl"></div>
    </div>

    <div className="relative z-10 max-w-6xl mx-auto px-4">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-extrabold text-black">
          <span className="bg-gradient-to-r from-red-500 via-orange-500 to-black text-transparent bg-clip-text">
            Why We're Different
          </span>
        </h2>
        <div className="w-16 h-1 bg-gradient-to-r from-red-500 to-black mx-auto my-3 rounded-full"></div>
        <p className="text-gray-700 font-medium max-w-md mx-auto">Quality that speaks for itself.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: "❄️", title: "Instant Freshness", desc: "Flash-frozen at perfect moment" },
          { icon: "⏱️", title: "5-Minute Meals", desc: "Ready faster than delivery" },
          { icon: "🌟", title: "Chef Quality", desc: "Restaurant recipes at home" },
          { icon: "♻️", title: "Zero Waste", desc: "Compostable packaging" }
        ].map((item, index) => (
          <div key={index} className="bg-white border border-black/10 p-5 rounded-2xl shadow hover:shadow-md transition-all text-center">
            <div className="w-10 h-10 mx-auto mb-3 text-2xl">{item.icon}</div>
            <h3 className="font-semibold text-black text-sm">{item.title}</h3>
            <p className="text-gray-600 text-xs mt-1">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);
