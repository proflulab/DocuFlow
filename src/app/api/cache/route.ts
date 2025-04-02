import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    try {
        const response = await fetch(`https://your-api-endpoint/cache?id=${id}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return NextResponse.json({ data });
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error('Cache fetch error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
        return NextResponse.json({ error: 'An unknown error occurred' }, { status: 500 });
    }
}