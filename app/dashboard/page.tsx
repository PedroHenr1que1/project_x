'use client'

import { useEffect, useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Book {
  id: string
  title: string
  author: string
  description?: string
  publishedAt?: string
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    if (status === 'authenticated') {
      fetchBooks()
    }
  }, [status])

  const fetchBooks = async () => {
    try {
      const response = await fetch('/api/books')
      if (!response.ok) throw new Error('Erro ao buscar livros')
      const data = await response.json()
      setBooks(data.books)
    } catch (error) {
      setError('Erro ao carregar livros')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar este livro?')) return

    try {
      const response = await fetch(`/api/books/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Erro ao deletar livro')

      setBooks(books.filter(book => book.id !== id))
    } catch (error) {
      alert('Erro ao deletar livro')
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="text-xl">Carregando...</div>
      </div>
    )
  }

  if (!session) return null

  return (
    <div className="min-h-screen bg-gray-900">
      
      <nav className="bg-gray-800 shadow-xl border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <h1 className="text-3xl font-extrabold text-white tracking-wide">
              📚 Biblioteca
            </h1>
            <div className="flex items-center gap-4">
              <span className="text-gray-400 hidden sm:inline">Olá, <span className="text-cyan-400 font-semibold">{session.user?.name}</span></span>
              
              <Link
                href="/payments"
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-semibold shadow-md"
              >
                Pagamentos PIX
              </Link>
              
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold shadow-md"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        <div className="flex justify-between items-center mb-10 border-b border-gray-700 pb-4">
          <h2 className="text-4xl font-extrabold text-white">Meus Livros</h2>
          
          <Link
            href="/dashboard/books/new"
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg shadow-lg hover:shadow-xl hover:from-cyan-400 hover:to-blue-500 transition-all duration-300 font-bold transform hover:scale-105"
          >
            + Adicionar Livro
          </Link>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-800/50 border border-red-600 text-red-300 rounded-lg">
            {error}
          </div>
        )}

        {books.length === 0 ? (
          <div className="text-center py-16 bg-gray-800 rounded-xl shadow-xl border border-gray-700">
            <p className="text-gray-400 text-xl mb-4">Nenhum livro cadastrado ainda</p>
            <Link
              href="/dashboard/books/new"
              className="text-cyan-400 hover:text-cyan-300 hover:underline font-semibold transition-colors"
            >
              Adicione seu primeiro livro
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {books.map((book) => (
              
              <div key={book.id} className="bg-gray-800 rounded-xl shadow-xl p-6 border border-gray-700 hover:border-blue-500 transition-all duration-300">
                <h3 className="text-2xl font-bold text-white mb-2 line-clamp-2">{book.title}</h3>
                <p className="text-gray-400 mb-2">por <span className="font-semibold">{book.author}</span></p>
                
                {book.description && (
                  <p className="text-gray-500 text-sm mb-4 line-clamp-3">{book.description}</p>
                )}
                
                {book.publishedAt && (
                  <p className="text-gray-600 text-xs mb-4 pt-2 border-t border-gray-700">Publicado em: {book.publishedAt}</p>
                )}
                
                <div className="flex gap-3 pt-3 border-t border-gray-700">
                  <Link
                    href={`/dashboard/books/${book.id}/edit`}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center font-semibold text-sm shadow-md"
                  >
                    Editar
                  </Link>
                  <button
                    onClick={() => handleDelete(book.id)}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold text-sm shadow-md"
                  >
                    Deletar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}