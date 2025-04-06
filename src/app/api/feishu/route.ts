import { NextResponse } from 'next/server';

export async function GET() {
    const FEISHU_APP_TOKEN = process.env.NEXT_PUBLIC_FEISHU_APP_ID;
    const FEISHU_TABLE_ID = process.env.NEXT_PUBLIC_FEISHU_TABLE_ID;
    const FEISHU_ACCESS_TOKEN = process.env.NEXT_PUBLIC_FEISHU_APP_SECRET;

    try {
        const response = await fetch(
            `https://base-api.larksuite.com/open-apis/bitable/v1/apps/${FEISHU_APP_TOKEN}/tables/${FEISHU_TABLE_ID}/records`,
            {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${FEISHU_ACCESS_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const data = await response.json();

        return new NextResponse(JSON.stringify(data), {
            status: 200,
            headers: {
                'Access-Control-Allow-Origin': 'http://localhost:3003',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                'Content-Type': 'application/json',
            },
        });
    } catch (error) {
        return new NextResponse(JSON.stringify({ error: 'Failed to fetch data' }), {
            status: 500,
            headers: {
                'Access-Control-Allow-Origin': 'http://localhost:3003',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                'Content-Type': 'application/json',
            },
        });
    }
}

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': 'http://localhost:3003',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    });
}