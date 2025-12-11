import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Sistema de Biblioteca
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Gerencie seus livros e realize pagamentos PIX de forma simples e segura
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/login"
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            Fazer Login
          </Link>
          <Link
            href="/register"
            className="px-8 py-3 bg-white text-blue-600 border-2 border-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-semibold"
          >
            Criar Conta
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">
              📚 Gerenciamento de Livros
            </h2>
            <p className="text-gray-600">
              Cadastre, edite e organize sua coleção de livros de forma intuitiva
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">
              💳 Pagamentos PIX
            </h2>
            <p className="text-gray-600">
              Realize transações PIX de forma rápida e segura através da integração com Payevo
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
