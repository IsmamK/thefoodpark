export const ProductHighlights = () => {
  const products = [
    {
      id: 1,
      name: "Korean Corndog",
      description: "Ready in 8 min",
      image: "https://images.immediate.co.uk/production/volatile/sites/30/2024/09/KoreanCorndog-63c63dc.jpg",
      features: ["No additives", "Veg option", "6-pack"]
    },
    {
      id: 2,
      name: "Breakfast Burrito",
      description: "Ready in 3 min", 
      image: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Burrito.JPG/1200px-Burrito.JPG",
      features: ["18g protein", "Easy prep", "Eco-pack"]
    },
    {
      id: 3,
      name: "Mac & Cheese",
      description: "Ready in 12 min",
      image: "https://www.kitchensanctuary.com/wp-content/uploads/2023/09/Four-cheese-mac-n-cheese-with-bacon-square-FS.jpg",
      features: ["Real cheese", "Al dente", "Serves 2"]
    }
  ];

  return (
    <div className=" mx-auto px-3 py-8">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-gray-900">
          Our <span className="text-purple-600">Favorites</span> 

        </h2>
        <div className="w-16 h-1 bg-gradient-to-r from-purple-400 to-pink-400 mx-auto mt-3 rounded-full"></div>

      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {products.map((product) => (
          <div key={product.id} className="bg-white rounded-lg border border-gray-100 p-3 hover:shadow-xs transition-all">
            {/* Product Image */}
            <div className="h-24 w-full mb-2 flex items-center justify-center">
              <img 
                src={product.image}
                alt={product.name}
                className="h-full w-full object-cover rounded-lg transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            
            {/* Product Info */}
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">{product.name}</h3>
              <p className="text-gray-500 text-xs mb-2">{product.description}</p>
              
              {/* Features */}
              <div className="flex flex-wrap gap-1 mb-2">
                {product.features.map((feature, i) => (
                  <span key={i} className="bg-gray-50 text-gray-600 text-xs px-2 py-0.5 rounded">
                    {feature}
                  </span>
                ))}
              </div>
              
           
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};