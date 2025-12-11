import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'

const paymentSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
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
    const { name, amount, document, description } = paymentSchema.parse(body)

    const apiKey = process.env.PAYEVO_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Chave de API não configurada' },
        { status: 500 }
      )
    }

    const authHeader = 'Basic ' + Buffer.from(apiKey).toString('base64')

    const response = await fetch(
      'https://apiv2.payevo.com.br/functions/v1/transactions',
      {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: amount,
          customer: {
            name: name,
            document: document
          },
          description: description,
          payment_method: 'pix'
        })
      }
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json(
        { error: 'Erro ao criar transação', details: errorData },
        { status: response.status }
      )
    }

    const data = await response.json()

    return NextResponse.json({ transaction: data })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erro ao processar pagamento' },
      { status: 500 }
    )
  }
}
