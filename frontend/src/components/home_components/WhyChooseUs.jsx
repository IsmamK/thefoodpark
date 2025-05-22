export const WhyChooseUs = () => (
    <div className="mb-20 mx-auto px-4 py-12">
      {/* Heading */}
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-gray-900">
          Why We're <span className="text-purple-600">Different</span>
        </h2>
        <div className="w-16 h-1 bg-gradient-to-r from-purple-400 to-pink-400 mx-auto mt-3 rounded-full"></div>
      </div>
  
      {/* Compact Feature Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-white/90 backdrop-blur-sm p-4 rounded-2xl border border-gray-100 shadow-xs hover:shadow-sm transition-all">
          <div className="w-10 h-10 mb-2 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600">
            ❄️
          </div>
          <h3 className="font-semibold text-gray-900 text-sm">Instant Freshness</h3>
          <p className="text-gray-500 text-xs mt-1">Flash-frozen at perfect moment</p>
        </div>
  
        {/* Card 2 */}
        <div className="bg-white/90 backdrop-blur-sm p-4 rounded-2xl border border-gray-100 shadow-xs hover:shadow-sm transition-all">
          <div className="w-10 h-10 mb-2 bg-pink-100 rounded-lg flex items-center justify-center text-pink-600">
            ⏱️
          </div>
          <h3 className="font-semibold text-gray-900 text-sm">5-Minute Meals</h3>
          <p className="text-gray-500 text-xs mt-1">Ready faster than delivery</p>
        </div>
  
        {/* Card 3 */}
        <div className="bg-white/90 backdrop-blur-sm p-4 rounded-2xl border border-gray-100 shadow-xs hover:shadow-sm transition-all">
          <div className="w-10 h-10 mb-2 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
            🌟
          </div>
          <h3 className="font-semibold text-gray-900 text-sm">Chef Quality</h3>
          <p className="text-gray-500 text-xs mt-1">Restaurant recipes at home</p>
        </div>
  
        {/* Card 4 */}
        <div className="bg-white/90 backdrop-blur-sm p-4 rounded-2xl border border-gray-100 shadow-xs hover:shadow-sm transition-all">
          <div className="w-10 h-10 mb-2 bg-green-100 rounded-lg flex items-center justify-center text-green-600">
            ♻️
          </div>
          <h3 className="font-semibold text-gray-900 text-sm">Zero Waste</h3>
          <p className="text-gray-500 text-xs mt-1">Compostable packaging</p>
        </div>
      </div>
    </div>
  );