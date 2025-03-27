import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    try {
        const response = await fetch(`https://your-api-endpoint/cache?id=${id}`);
        const data = await response.json();
        return NextResponse.json({ data });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
    }
}