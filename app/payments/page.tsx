'use client'

import { useState, FormEvent, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import QRCode from 'qrcode'

interface Transaction {
  transactionId?: string
  pixCode?: string
  status?: string
  qrCodeBase64?: string
  paymentUrl?: string
}

export default function PaymentsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [document, setDocument] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [transaction, setTransaction] = useState<Transaction | null>(null)
  const [qrCodeImage, setQrCodeImage] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    if (transaction?.pixCode) {
      generateQRCode(transaction.pixCode)
    }
  }, [transaction])

  const generateQRCode = async (pixCode: string) => {
    try {
      const qrCodeDataUrl = await QRCode.toDataURL(pixCode)
      setQrCodeImage(qrCodeDataUrl)
    } catch (error) {
      console.error('Erro ao gerar QR Code:', error)
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    setTransaction(null)

    try {
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          amount: parseFloat(amount),
          document: document.replace(/\D/g, ''),
          description
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao criar transação')
      }

      setTransaction(data.transaction)
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Ocorreu um erro desconhecido.');
      }
    } finally {
      setLoading(false);
    }
  }

  const formatCurrency = (value: string) => {
    const numericValue = value.replace(/\D/g, '')
    const floatValue = parseFloat(numericValue) / 100
    return floatValue.toFixed(2)
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCurrency(e.target.value)
    setAmount(formatted)
  }

  const formatCPF = (value: string) => {
    const numericValue = value.replace(/\D/g, '')
    return numericValue
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
  }

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value)
    setDocument(formatted)
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Carregando...</div>
      </div>
    )
  }

  if (!session) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link href="/dashboard" className="text-blue-600 hover:underline">
              ← Voltar para Dashboard
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Pagamentos PIX</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Criar Transação</h2>

            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do Comprador *
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nome completo"
                />
              </div>

              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                  Valor (R$) *
                </label>
                <input
                  id="amount"
                  type="text"
                  value={amount}
                  onChange={handleAmountChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label htmlFor="document" className="block text-sm font-medium text-gray-700 mb-1">
                  CPF *
                </label>
                <input
                  id="document"
                  type="text"
                  value={document}
                  onChange={handleDocumentChange}
                  required
                  maxLength={14}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="000.000.000-00"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição *
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Descrição da transação"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processando...' : 'Gerar PIX'}
              </button>
            </form>
          </div>

          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Resultado da Transação</h2>

            {!transaction ? (
              <div className="text-center py-12 text-gray-500">
                Preencha o formulário e clique em &quot;Gerar PIX&apos; para criar uma transação
              </div>
            ) : (
              <div className="space-y-4">
                {qrCodeImage && (
                  <div className="flex justify-center mb-4">
                    <img src={qrCodeImage} alt="QR Code PIX" className="w-64 h-64" />
                  </div>
                )}

                <div className="space-y-2">
                  {transaction.transactionId && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">ID da Transação:</p>
                      <p className="text-gray-900 break-all">{transaction.transactionId}</p>
                    </div>
                  )}

                  {transaction.status && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">Status:</p>
                      <p className="text-gray-900">{transaction.status}</p>
                    </div>
                  )}

                  {transaction.pixCode && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">Código PIX:</p>
                      <p className="text-gray-900 text-xs break-all bg-gray-50 p-2 rounded">
                        {transaction.pixCode}
                      </p>
                    </div>
                  )}

                  {transaction.paymentUrl && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">Link de Pagamento:</p>
                      <a
                        href={transaction.paymentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline break-all"
                      >
                        {transaction.paymentUrl}
                      </a>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setTransaction(null)}
                  className="w-full py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors font-semibold mt-4"
                >
                  Nova Transação
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
