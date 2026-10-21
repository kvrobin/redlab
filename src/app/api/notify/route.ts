import { NextRequest, NextResponse } from 'next/server';
import { dispatchRedLabEvent, RedLabNotificationPayload } from '@/lib/automation/notifier';

export async function POST(req: NextRequest) {
  try {
    const body: RedLabNotificationPayload = await req.json();

    if (!body.title || !body.message) {
      return NextResponse.json(
        { error: 'Hiányzó kötelező mezők: title vagy message' },
        { status: 400 }
      );
    }

    const result = await dispatchRedLabEvent(body);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('API /api/notify error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Szerver hiba az értesítés küldése során',
      },
      { status: 500 }
    );
  }
}
