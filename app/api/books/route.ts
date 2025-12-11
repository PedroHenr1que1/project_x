import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

const bookSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  author: z.string().min(1, 'Autor é obrigatório'),
  description: z.string().optional(),
  publishedAt: z.string().optional()
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const books = await prisma.book.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ books })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao buscar livros' },
      { status: 500 }
    )
  }
}

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
    const { title, author, description, publishedAt } = bookSchema.parse(body)

    const book = await prisma.book.create({
      data: {
        title,
        author,
        description,
        publishedAt,
        userId: session.user.id
      }
    })

    return NextResponse.json({ book }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erro ao criar livro' },
      { status: 500 }
    )
  }
}
