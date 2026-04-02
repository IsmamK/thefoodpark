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
    <>
    <section className="relative   m-0 bg-white text-black overflow-hidden ">
              

    <div className="w-full h-4 bg-gradient-to-r from-red-200 to-orange-500 mx-auto "></div>

      {/* Colorful background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-10 w-72 h-72 bg-orange-400/10 rounded-full filter blur-2xl" />
        <div className="absolute bottom-0 -right-10 w-72 h-72 bg-red-500/10 rounded-full filter blur-2xl" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-black">
            <span className="bg-gradient-to-r from-red-500 via-orange-500 to-black text-transparent bg-clip-text">
              Our Favorites
            </span>
          </h2>
          <div className="w-16 h-1 bg-gradient-to-r from-red-500 to-black mx-auto my-3 rounded-full"></div>
          <p className="text-gray-700 font-medium max-w-md mx-auto">Best sellers, best flavors.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {products.map((product) => (
            <div key={product.id} className="bg-white border border-black/10 rounded-2xl p-4 shadow hover:shadow-md transition-all">
              <div className="h-28 w-full mb-3 flex items-center justify-center">
                <img 
                  src={product.image}
                  alt={product.name}
                  className="h-full w-full object-cover rounded-lg transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <h3 className="font-semibold text-black text-sm">{product.name}</h3>
              <p className="text-gray-500 text-xs mb-2">{product.description}</p>
              <div className="flex flex-wrap gap-1">
                {product.features.map((feature, i) => (
                  <span key={i} className="bg-black/5 text-gray-700 text-xs px-2 py-0.5 rounded">
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="w-full h-4 bg-gradient-to-r from-red-200 to-orange-500 mx-auto mt-10 "></div>

    </section>
    </>

  );
};
