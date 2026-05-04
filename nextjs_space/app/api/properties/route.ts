export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') ?? '';
    const type = searchParams.get('type') ?? '';
    const status = searchParams.get('status') ?? '';
    const where: any = {};
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' as any } },
        { address: { contains: search, mode: 'insensitive' as any } },
      ];
    }
    if (type) where.type = type;
    if (status) where.status = status;
    const properties = await prisma.property.findMany({
      where, orderBy: { createdAt: 'desc' }, take: 100,
      include: { photos: { orderBy: { order: 'asc' }, take: 1 } },
    });
    return NextResponse.json(properties);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json();
    const property = await prisma.property.create({
      data: {
        title: body.title,
        type: body.type ?? 'apartment',
        address: body.address,
        district: body.district ?? null,
        city: body.city ?? 'Київ',
        rooms: body.rooms ? parseInt(body.rooms) : null,
        area: body.area ? parseFloat(body.area) : null,
        floor: body.floor ? parseInt(body.floor) : null,
        totalFloors: body.totalFloors ? parseInt(body.totalFloors) : null,
        price: parseFloat(body.price),
        currency: body.currency ?? 'USD',
        description: body.description ?? null,
      },
    });
    return NextResponse.json(property);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Error' }, { status: 500 });
  }
}
