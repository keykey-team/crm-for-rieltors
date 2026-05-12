export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const property = await prisma.property.findUnique({
      where: { id: params.id },
      include: { photos: { orderBy: { order: 'asc' } }, deals: true },
    });
    if (!property) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(property);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Error' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json();
    const property = await prisma.property.update({
      where: { id: params.id },
      data: {
        ...(body.title !== undefined && { title: body.title }),
        ...(body.type !== undefined && { type: body.type }),
        ...(body.address !== undefined && { address: body.address }),
        ...(body.district !== undefined && { district: body.district }),
        ...(body.rooms !== undefined && { rooms: body.rooms ? parseInt(body.rooms) : null }),
        ...(body.area !== undefined && { area: body.area ? parseFloat(body.area) : null }),
        ...(body.floor !== undefined && { floor: body.floor ? parseInt(body.floor) : null }),
        ...(body.totalFloors !== undefined && { totalFloors: body.totalFloors ? parseInt(body.totalFloors) : null }),
        ...(body.price !== undefined && { price: parseFloat(body.price) }),
        ...(body.status !== undefined && { status: body.status }),
        ...(body.description !== undefined && { description: body.description }),
      },
    });
    return NextResponse.json(property);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Error' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await prisma.property.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Error' }, { status: 500 });
  }
}
