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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const book = await prisma.book.findFirst({
      where: {
        id: id,
        userId: session.user.id
      }
    })

    if (!book) {
      return NextResponse.json(
        { error: 'Livro não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({ book })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao buscar livro' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
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

    const existingBook = await prisma.book.findFirst({
      where: {
        id: id,
        userId: session.user.id
      }
    })

    if (!existingBook) {
      return NextResponse.json(
        { error: 'Livro não encontrado' },
        { status: 404 }
      )
    }

    const book = await prisma.book.update({
      where: { id: id },
      data: {
        title,
        author,
        description,
        publishedAt
      }
    })

    return NextResponse.json({ book })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erro ao atualizar livro' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const existingBook = await prisma.book.findFirst({
      where: {
        id: id,
        userId: session.user.id
      }
    })

    if (!existingBook) {
      return NextResponse.json(
        { error: 'Livro não encontrado' },
        { status: 404 }
      )
    }

    await prisma.book.delete({
      where: { id: id }
    })

    return NextResponse.json({ message: 'Livro deletado com sucesso' })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao deletar livro' },
      { status: 500 }
    )
  }
}
