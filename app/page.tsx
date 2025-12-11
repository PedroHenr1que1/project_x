import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-4">
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        
        <h1 className="text-6xl sm:text-7xl font-extrabold mb-4 tracking-tight">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
            Biblioteca Digital
          </span>
        </h1>
        
        <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
          Gerencie sua coleção de livros e simplifique suas transações com a integração PIX Payevo.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/login"
            className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl shadow-lg hover:shadow-xl hover:from-cyan-400 hover:to-blue-500 transition-all duration-300 font-bold transform hover:scale-105"
          >
            Acessar Conta
          </Link>
          <Link
            href="/register"
            className="px-8 py-3 text-cyan-400 border-2 border-cyan-500 rounded-xl hover:bg-cyan-900/50 transition-colors duration-300 font-semibold transform hover:scale-105"
          >
            Criar Nova Conta
          </Link>
        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl border border-gray-700/50 hover:border-cyan-500 transition-all duration-300">
            <div className="text-4xl mb-3 text-cyan-400">
              📚
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">
              Gestão de Acervo
            </h2>
            <p className="text-gray-400">
              Cadastre, organize e mantenha o controlo completo sobre a sua biblioteca digital.
            </p>
          </div>
          
          <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl border border-gray-700/50 hover:border-blue-500 transition-all duration-300">
            <div className="text-4xl mb-3 text-blue-400">
              ⚡
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">
              Transações Instantâneas
            </h2>
            <p className="text-gray-400">
              Fácil integração de pagamentos e recebimentos usando o PIX, powered by Payevo.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}