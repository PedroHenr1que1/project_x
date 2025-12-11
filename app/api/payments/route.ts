import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'

const paymentSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'), 
  phone: z.string().min(8, 'Telefone inválido'), 
  amount: z.number().positive('Valor deve ser positivo'),
  document: z.string().min(11, 'CPF inválido'),
  description: z.string().min(1, 'Descrição é obrigatória')
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, email, phone, amount, document, description } = paymentSchema.parse(body)

    const apiKey = process.env.PAYEVO_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Chave de API não configurada' },
        { status: 500 }
      )
    }

    const authHeader = 'Basic ' + Buffer.from(apiKey + ':').toString('base64')
    const amountInCents = Math.round(amount * 100) 
    const documentOnlyNumbers = document.replace(/\D/g, '')

    const transactionBody = {
        amount: amountInCents, 
        description: description,
        paymentMethod: 'PIX', 
        customer: {
            name: name,
            email: email, 
            phone: phone.replace(/\D/g, ''),
            document: { 
                type: documentOnlyNumbers.length > 11 ? 'CNPJ' : 'CPF',
                number: documentOnlyNumbers
            }
        },
        pix: { 
            expiresInDays: 1, 
        },
        items: [{ 
          title: description.substring(0, 50),
          unitPrice: amountInCents,
          quantity: 1,
          externalRef: `TRX-${Date.now()}`
        }]
    }

    const response = await fetch(
      'https://apiv2.payevo.com.br/functions/v1/transactions',
      {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(transactionBody)
      }
    )

    if (!response.ok) {
      let errorDetails = {}
      let rawResponseText = ''

      try {
          rawResponseText = await response.text()
      } catch (e) {
          rawResponseText = 'N/A (Falha ao ler o corpo da resposta)'
      }

      try {
        errorDetails = JSON.parse(rawResponseText)
      } catch (e) {
        errorDetails = { raw_error_text: rawResponseText }
      }
      
      const statusMessage = `Erro ao criar transação (Payevo Status: ${response.status})`

      console.error('ERRO DA API PAYEVO:', {
          status: response.status,
          details: errorDetails
      })

      return NextResponse.json(
        { error: statusMessage, details: errorDetails },
        { status: response.status }
      )
    }

    try {
        const data = await response.json()
        return NextResponse.json({ transaction: data })
    } catch (e) {
        const responseText = await response.text().catch(() => 'Corpo vazio')
        console.error('ERRO CRÍTICO: Falha ao ler JSON de SUCESSO da Payevo.', {
            error: e,
            status: response.status,
            rawText: responseText
        })
        
        return NextResponse.json(
            { error: `Resposta de sucesso da Payevo inválida ou vazia (Status: ${response.status})` },
            { status: 500 }
        )
    }

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erro de rede ou Timeout (Verifique o terminal do servidor para diagnóstico)' },
      { status: 500 }
    )
  }
}