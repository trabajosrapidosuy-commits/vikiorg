import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

// GET: Get single product by ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    const { data: product, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', params.id)
      .eq('status', 'active')
      .single()

    if (error || !product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json({ product })
  } catch (err) {
    return NextResponse.json(
      { error: `Server error: ${String(err)}` },
      { status: 500 }
    )
  }
}
