import { NextResponse } from 'next/server';
import { Client, withTenantToken } from '@larksuiteoapi/node-sdk';

export async function GET(request: Request) {
  
    const FEISHU_APP_ID = process.env.FEISHU_APP_ID;
    const FEISHU_APP_SECRET = process.env.FEISHU_APP_SECRET;
    const FEISHU_APP_TOKEN = process.env.FEISHU_APP_TOKEN;
    const FEISHU_TABLE_ID = process.env.FEISHU_TABLE_ID;
    const FEISHU_VIEW_ID = process.env.FEISHU_VIEW_ID;
    const FEISHU_FIELD_NAME1 = process.env.FEISHU_FIELD_NAME1;
    const FEISHU_FIELD_NAME2 = process.env.FEISHU_FIELD_NAME2;
    const FEISHU_FIELD_NAME3 = process.env.FEISHU_FIELD_NAME3;

    const FEISHU_FIELD_NAME5 = process.env.FEISHU_FIELD_NAME5;

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('student_id');
    
    // 验证student_id参数格式
    if (!studentId || !studentId.trim()) {
      console.error('无效的student_id参数:', studentId, 'URL:', request.url);
      return NextResponse.json(
        { 
          error: 'student_id参数不能为空',
          details: `请提供有效的student_id参数，当前值为: ${studentId}`,
          example: '?student_id=123456'
        },
        { status: 400 }
      );
    }
    
    // // 验证学号格式 - 只允许字母数字
    // const studentIdRegex = /^[a-zA-Z0-9]+$/;
    // if (!studentIdRegex.test(studentId)) {
    //   console.error('无效的学号格式:', studentId);
    //   return NextResponse.json(
    //     {
    //       error: '学号格式无效',
    //       details: '学号只能包含字母和数字',
    //       example: '?student_id=ABC123'
    //     },
    //     { status: 400 }
    //   );
    // }
    
    const userIdType = searchParams.get('user_id_type') || 'open_id';
    const withSharedUrl = searchParams.get('with_shared_url') === 'false';
    const automaticFields = searchParams.get('automatic_fields') === 'false';

    const client = new Client({
        appId: FEISHU_APP_ID || '',
        appSecret: FEISHU_APP_SECRET || '',
        disableTokenCache: false
    });

    try {


        const params = {
            path: {
                app_token: FEISHU_APP_TOKEN || '',
                table_id: FEISHU_TABLE_ID || ''
            },
            // params: {
            //     user_id_type: userIdType,
            //     page_size: 10
            // },
            data: {
                view_id: FEISHU_VIEW_ID || '',
                // field_names: [FEISHU_FIELD_NAME1 || '', FEISHU_FIELD_NAME2 || '', FEISHU_FIELD_NAME3 || '', FEISHU_FIELD_NAME5 || '', ],
                sort: [ {
                    field_name:'学生学号',
                    desc:true,
                    } ],
                filter: {
                    conjunction: 'and',
                    conditions: [
                        {
                            field_name: FEISHU_FIELD_NAME1 || '',
                            operator: 'is',
                            value: [studentId]
                        }
        ]
                },
                automatic_fields: false
            }
        };

        console.log('请求参数:', JSON.stringify(params, null, 2));
        const data = await client.bitable.v1.appTableRecord.search(
            {
                path: {
                    app_token: FEISHU_APP_TOKEN || '',
                    table_id: FEISHU_TABLE_ID || ''
                },
                data: {
                    view_id: FEISHU_VIEW_ID || '',
                    // field_names: [FEISHU_FIELD_NAME1 || '', FEISHU_FIELD_NAME2 || '', FEISHU_FIELD_NAME3 || '', FEISHU_FIELD_NAME5 || ''],
                    sort: [{
                        field_name: '学生学号',
                        desc: true,
                    }],
                    filter: {
                        conjunction: 'and' as const,
                        conditions: [
                            {
                                field_name: FEISHU_FIELD_NAME1 || '',
                                operator: 'is',
                                value: [studentId]
                            }
                        ]
                    },
                    automatic_fields: false
                }
            },
            withTenantToken("")
        );
        console.log('飞书返回数据:', JSON.stringify(data, null, 2));
        if (!data) {
            console.error('飞书API返回空数据');
        } else if (typeof data !== 'object') {
            console.error('飞书API返回数据格式异常:', typeof data);
        }

        console.log('返回数据:', JSON.stringify(data, null, 2));
        
        // 验证返回数据是否为有效的JSON
        let responseData;
        try {
            responseData = JSON.parse(JSON.stringify(data));
        } catch (error) {
            console.error('返回数据JSON序列化失败:', error);
            return new NextResponse(JSON.stringify({
                error: '服务器返回了无效的JSON数据',
                details: '请检查飞书API返回的数据格式'
            }), {
                status: 500,
                headers: {
                    'Access-Control-Allow-Origin': 'http://localhost:3000',
                    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                    'Content-Type': 'application/json',
                },
            });
        }
        
        return new NextResponse(JSON.stringify(responseData), {
            status: 200,
            headers: {
                'Access-Control-Allow-Origin': 'http://localhost:3000',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                'Content-Type': 'application/json',
            },
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('飞书API错误:', {
          message: errorMessage,
          stack: error instanceof Error ? error.stack : '无堆栈信息',
          requestParams: {
            studentId: studentId,
            userIdType: userIdType,
            withSharedUrl: withSharedUrl,
            automaticFields: automaticFields
          }
        });
        
        let statusCode = 500;
        let errorResponse = { error: `Failed to fetch data: ${errorMessage}` };
        
        // 处理400错误
        if (errorMessage.includes('400') || errorMessage.includes('Bad Request')) {
          statusCode = 400;
          errorResponse = { 
            error: '请求参数错误'
          };
        }
        
        return new NextResponse(JSON.stringify(errorResponse), {
            status: statusCode,
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