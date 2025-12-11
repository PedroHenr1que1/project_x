'use client'

import { useState, FormEvent, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import QRCode from 'qrcode'

interface Transaction {
  id: string;
  amount: number;
  netAmount: number;
  status: string;
  pix: {
    qrcode: string;
    expirationDate: string;
  };
  customer: {
    name: string;
    email: string;
  };
}

export default function PaymentsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState(session?.user?.email || '')
  const [phone, setPhone] = useState('')
  const [amount, setAmount] = useState('')
  const [document, setDocument] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [transaction, setTransaction] = useState<Transaction | null>(null)
  const [qrCodeImage, setQrCodeImage] = useState('')
  const [showQrCodeImage, setShowQrCodeImage] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    if (transaction?.pix?.qrcode) {
      generateQRCode(transaction.pix.qrcode)
    }
  }, [transaction])
  
  useEffect(() => {
    if (session?.user?.email) {
      setEmail(session.user.email);
    }
  }, [session]);

  const generateQRCode = async (pixCode: string) => {
    try {
      const qrCodeDataUrl = await QRCode.toDataURL(pixCode)
      setQrCodeImage(qrCodeDataUrl)
    } catch (error) {
      console.error('Erro ao gerar QR Code:', error)
      setQrCodeImage('')
    }
  }

  // NOVA FUNÇÃO: Limpa todos os estados do formulário
  const handleNewTransaction = () => {
    setTransaction(null);
    setQrCodeImage('');
    setShowQrCodeImage(false);
    setError('');
    
    // Limpar campos do formulário
    setName('');
    // Mantém o email do usuário logado se estiver disponível
    setEmail(session?.user?.email || ''); 
    setPhone('');
    setAmount('');
    setDocument('');
    setDescription('');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    setTransaction(null)
    setQrCodeImage('')
    setShowQrCodeImage(false)

    try {
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone: phone.replace(/\D/g, ''), 
          amount: parseFloat(amount),
          document: document.replace(/\D/g, ''),
          description
        })
      })

      const data = await response.json()

      if (!response.ok) {
        let errorMessage = data.error || 'Erro ao criar transação'
        
        if (data.details && typeof data.details === 'object') {
             if (data.details.raw_error) {
                 errorMessage += ` Detalhe: ${data.details.raw_error.substring(0, 50)}...`
             } else if (data.details.message) {
                 errorMessage += ` Detalhe: ${data.details.message}`
             }
        }
        
        throw new Error(errorMessage)
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
  
  const formatPhone = (value: string) => {
    const numericValue = value.replace(/\D/g, '')
    return numericValue
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1')
  }

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value)
    setDocument(formatted)
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value)
    setPhone(formatted)
  }

  const formatCentsToBRL = (cents: number) => {
    return (cents / 100).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };
  
  const formatExpirationDate = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
    } catch (e) {
      return isoString;
    }
  };


  if (status === 'loading') {
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
          <div className="flex items-center h-16">
            <Link 
              href="/dashboard" 
              className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Voltar para Dashboard
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h1 className="text-3xl font-extrabold text-white mb-6 border-b border-gray-700 pb-3">
            💸 Pagamentos PIX
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          <div className="bg-gray-800 rounded-xl shadow-2xl p-6 border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-4">Criar Transação</h2>

            {error && (
              <div className="mb-4 p-3 bg-red-800/50 border border-red-600 text-red-300 rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label htmlFor="name" className="block text-xs font-medium text-gray-300 mb-1">
                  Nome do Comprador <span className="text-red-500">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-sm bg-gray-700 border border-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 placeholder-gray-500"
                  placeholder="Nome completo"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-xs font-medium text-gray-300 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-sm bg-gray-700 border border-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 placeholder-gray-500"
                  placeholder="seuemail@exemplo.com"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-xs font-medium text-gray-300 mb-1">
                  Telefone <span className="text-red-500">*</span>
                </label>
                <input
                  id="phone"
                  type="text"
                  value={phone}
                  onChange={handlePhoneChange}
                  required
                  maxLength={15}
                  className="w-full px-3 py-2 text-sm bg-gray-700 border border-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 placeholder-gray-500"
                  placeholder="(99) 99999-9999"
                />
              </div>

              <div>
                <label htmlFor="amount" className="block text-xs font-medium text-gray-300 mb-1">
                  Valor (R$) <span className="text-red-500">*</span>
                </label>
                <input
                  id="amount"
                  type="text"
                  value={amount}
                  onChange={handleAmountChange}
                  required
                  className="w-full px-3 py-2 text-sm bg-gray-700 border border-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 placeholder-gray-500"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label htmlFor="document" className="block text-xs font-medium text-gray-300 mb-1">
                  CPF <span className="text-red-500">*</span>
                </label>
                <input
                  id="document"
                  type="text"
                  value={document}
                  onChange={handleDocumentChange}
                  required
                  maxLength={14}
                  className="w-full px-3 py-2 text-sm bg-gray-700 border border-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 placeholder-gray-500"
                  placeholder="000.000.000-00"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-xs font-medium text-gray-300 mb-1">
                  Descrição <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  rows={2}
                  className="w-full px-3 py-2 text-sm bg-gray-700 border border-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 placeholder-gray-500"
                  placeholder="Descrição da transação"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-lg hover:from-emerald-400 hover:to-green-500 transition-all font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed mt-3"
              >
                {loading ? 'Processando...' : 'Gerar PIX'}
              </button>
            </form>
          </div>

          <div className="bg-gray-800 rounded-xl shadow-2xl p-6 border border-gray-700 text-gray-200">
            <h2 className="text-xl font-bold text-white mb-4">Resultado da Transação</h2>

            {!transaction ? (
              <div className="text-center py-10 text-gray-500">
                Preencha o formulário e clique em &quot;Gerar PIX&quot; para criar uma transação
              </div>
            ) : (
              <div className="space-y-4">
                
                <div className="text-center mb-4">
                  <span className={`inline-flex items-center px-3 py-1 text-xs font-bold uppercase rounded-full tracking-wider shadow-lg ${
                    transaction.status === 'waiting_payment'
                      ? 'bg-yellow-800/70 text-yellow-300 border border-yellow-600'
                      : 'bg-green-800/70 text-green-300 border border-green-600'
                  }`}>
                    {transaction.status.toUpperCase().replace('_', ' ')}
                  </span>
                </div>

                <button
                    onClick={() => setShowQrCodeImage(!showQrCodeImage)}
                    className="w-full py-1.5 text-sm bg-gray-700 text-cyan-400 rounded-lg hover:bg-gray-600 transition-colors font-semibold"
                >
                    {showQrCodeImage ? 'Ocultar QR Code' : 'Visualizar QR Code'}
                </button>
                
                {showQrCodeImage && qrCodeImage && (
                    <div className="flex flex-col items-center justify-center border border-gray-700 p-2 rounded-lg bg-gray-900/50 my-2">
                        <img 
                            src={qrCodeImage} 
                            alt="QR Code PIX" 
                            className="w-40 h-40 border-2 border-cyan-500 p-1 rounded-lg bg-white" 
                        />
                    </div>
                )}

                <div className="space-y-3 pt-2">
                  <h3 className="text-base font-bold border-b border-gray-700 pb-1">Código PIX (Copia e Cola)</h3>
                  
                  {transaction.pix.qrcode && (
                    <div className="relative">
                      <p className="text-cyan-400 text-xs break-all bg-gray-700 p-2 rounded border border-dashed border-gray-600 font-mono">
                        {transaction.pix.qrcode}
                      </p>
                      <button
                        onClick={() => {
                            navigator.clipboard.writeText(transaction.pix.qrcode);
                            alert('Código PIX Copiado!');
                        }}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 rounded hover:bg-gray-600 transition-colors"
                        title="Copiar Código"
                      >
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v4a1 1 0 001 1h4a1 1 0 001-1V7m0 0V4a1 1 0 00-1-1H9a1 1 0 00-1 1v3m0 0H6a2 2 0 00-2 2v10a2 2 0 002 2h6a2 2 0 002-2v-3m0 0h-2" />
                         </svg>
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-2 pt-1">
                    <h3 className="text-base font-bold border-b border-gray-700 pb-1">Detalhes Financeiros</h3>
                    <div className="grid grid-cols-2 gap-y-2 text-sm">
                        <p className="font-medium text-gray-400">Valor Bruto:</p>
                        <p className="text-white font-mono">{formatCentsToBRL(transaction.amount)}</p>
                        
                        <p className="font-medium text-gray-400">Valor Líquido:</p>
                        <p className="text-white font-mono">{formatCentsToBRL(transaction.netAmount)}</p>

                        <p className="font-medium text-gray-400">Expira em:</p>
                        <p className="text-white">{formatExpirationDate(transaction.pix.expirationDate)}</p>
                    </div>
                </div>

                <div className="space-y-1 pt-1">
                  <h3 className="text-base font-bold border-b border-gray-700 pb-1">Identificadores</h3>
                  <p className="text-sm font-medium text-gray-400">ID da Transação:</p>
                  <p className="text-white text-xs break-all font-mono bg-gray-700 p-1 rounded">{transaction.id}</p>
                  
                  <p className="text-sm font-medium text-gray-400 pt-1">Comprador:</p>
                  <p className="text-white text-xs break-all">
                      {transaction.customer.name} (<span className="text-cyan-400">{transaction.customer.email}</span>)
                  </p>
                </div>

                <button
                  onClick={handleNewTransaction}
                  className="w-full py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors font-semibold mt-4 shadow-md"
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