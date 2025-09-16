export const Header = () =>{ 
  return (
     <div className="bg-white border-b bg-[#3f2b96] border-gray-400 shadow-sm px-6 py-[1.7rem]">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            
           <div className="w-10 h-11 sm:w-12 sm:h-12 bg-white/30 rounded-full flex items-center justify-center backdrop-blur-sm shadow-lg overflow-hidden cursor-pointer">
            <img 
              src="https://as1.ftcdn.net/jpg/03/10/42/46/1000_F_310424659_USd3Coot4FUrJivOmDhCA5g0vNk3CVUW.jpg" 
              alt="Ocean Logo" 
              className="w-full h-full object-cover"
            />
          </div>

            <div>
              <h1 className="text-xl font-bold text-gray-800">ARGO Data Assistant</h1>
              <p className="text-sm text-gray-600">Explore oceanographic data with AI</p>
            </div>

          </div>
        </div>
      </div>

  )
}