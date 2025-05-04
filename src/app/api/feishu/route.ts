import { NextResponse } from 'next/server';

export async function GET() {
    const FEISHU_APP_TOKEN = process.env.FEISHU_APP_TOKEN;
    const FEISHU_TABLE_ID = process.env.FEISHU_TABLE_ID;
    const FEISHU_ACCESS_TOKEN = process.env.FEISHU_ACCESS_TOKEN;

    try {
        const response = await fetch(
            `https://base-api.feishu.cn/open-apis/bitable/v1/apps/${FEISHU_APP_TOKEN}/tables/${FEISHU_TABLE_ID}/records`,
            {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${FEISHU_ACCESS_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const data = await response.json();
        console.log('飞书返回数据:', JSON.stringify(data, null, 2));

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
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('飞书API错误:', errorMessage);
        return new NextResponse(JSON.stringify({ error: `Failed to fetch data: ${errorMessage}` }), {
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