/**
 * RED Lab Automated Notification Engine
 * Channels:
 * 1. In-App Realtime (database notifications + activity log + client toast)
 * 2. Discord / Slack Webhook (Rich crimson embed cards)
 * 3. Supervisor Email Notification (Resend API HTML email)
 */

export type RedLabEventType =
  | 'FILE_NEW_VERSION'
  | 'TASK_READY_FOR_PROFESSOR'
  | 'MILESTONE_SIGNED_OFF'
  | 'MEETING_PROPOSED'
  | 'MEETING_RESCHEDULE_NEEDED'
  | 'MEETING_CONFIRMED'
  | 'TEST_NOTIFICATION';

export interface RedLabNotificationPayload {
  eventType: RedLabEventType;
  title: string;
  message: string;
  actorName: string;
  actorEmail?: string;
  workstream?: string;
  targetUrl?: string;
  metadata?: Record<string, any>;
  customWebhookUrl?: string;
  sendEmail?: boolean;
  recipientEmail?: string;
}

export interface NotificationDispatchResult {
  success: boolean;
  discordSent: boolean;
  emailSent: boolean;
  discordStatus?: string;
  emailStatus?: string;
  timestamp: string;
}

// RED Lab Crimson Color: 0xE11D48 = 14753096 in decimal for Discord Embeds
const RED_LAB_CRIMSON_INT = 14753096;

/**
 * Returns formatted Hungarian label for event types
 */
export function getEventCategoryLabel(type: RedLabEventType): string {
  switch (type) {
    case 'FILE_NEW_VERSION':
      return 'Tudományos Fájltár Revízió';
    case 'TASK_READY_FOR_PROFESSOR':
      return 'Témavezetői Véleményezésre Vár';
    case 'MILESTONE_SIGNED_OFF':
      return 'Mérföldkő Jóváhagyás / Szignó';
    case 'MEETING_PROPOSED':
      return 'Új Konzultációs Szavazás';
    case 'MEETING_RESCHEDULE_NEEDED':
      return 'Újraütemezés Szükséges (Ütközés)';
    case 'MEETING_CONFIRMED':
      return 'Megbeszélés Időpont Véglegesítve';
    case 'TEST_NOTIFICATION':
    default:
      return 'Rendszer Teszt Értesítés';
  }
}

/**
 * Sends Discord Embed via Webhook
 */
export async function sendDiscordWebhook(
  payload: RedLabNotificationPayload
): Promise<{ sent: boolean; status: string }> {
  const webhookUrl =
    payload.customWebhookUrl ||
    process.env.DISCORD_WEBHOOK_URL ||
    process.env.NEXT_PUBLIC_DISCORD_WEBHOOK_URL;

  if (!webhookUrl || !webhookUrl.startsWith('http')) {
    return {
      sent: false,
      status: 'Nincs érvényes Discord Webhook URL beállítva (szimulált sikeres mód)',
    };
  }

  const appBaseUrl =
    process.env.NEXT_PUBLIC_APP_URL || 'https://redlab-workspace.internal';
  const fullTargetUrl = payload.targetUrl
    ? payload.targetUrl.startsWith('http')
      ? payload.targetUrl
      : `${appBaseUrl}${payload.targetUrl}`
    : appBaseUrl;

  const embedFields = [
    {
      name: '👤 Kutató / Felelős',
      value: payload.actorName || 'RED Lab Rendszer',
      inline: true,
    },
    {
      name: '🔬 Terület',
      value: payload.workstream || 'Közös kutatás',
      inline: true,
    },
    {
      name: '🏷️ Esemény Típus',
      value: getEventCategoryLabel(payload.eventType),
      inline: true,
    },
  ];

  if (payload.metadata) {
    Object.entries(payload.metadata).forEach(([key, val]) => {
      if (typeof val === 'string' || typeof val === 'number') {
        embedFields.push({
          name: `📌 ${key}`,
          value: String(val),
          inline: true,
        });
      }
    });
  }

  const discordBody = {
    username: 'RED Lab Vezérlő Bot',
    avatar_url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=256&q=80',
    embeds: [
      {
        title: `🔴 ${payload.title}`,
        description: `${payload.message}\n\n[👉 **Közvetlen Ugrás a RED Lab Felületére**](${fullTargetUrl})`,
        url: fullTargetUrl,
        color: RED_LAB_CRIMSON_INT,
        fields: embedFields,
        footer: {
          text: 'RED Lab Automata Kommunikációs Motor • Tudományos Kutatócsoport',
        },
        timestamp: new Date().toISOString(),
      },
    ],
  };

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(discordBody),
    });

    if (res.ok) {
      return { sent: true, status: 'Discord Embed üzenet sikeresen kiküldve!' };
    } else {
      const errText = await res.text();
      return {
        sent: false,
        status: `Discord hiba: ${res.status} ${errText.substring(0, 100)}`,
      };
    }
  } catch (err: any) {
    return {
      sent: false,
      status: `Hálózati hiba a Discord webhook hívásakor: ${err.message}`,
    };
  }
}

/**
 * Sends Supervisor Email Notification (Resend API)
 */
export async function sendSupervisorEmail(
  payload: RedLabNotificationPayload
): Promise<{ sent: boolean; status: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const recipient =
    payload.recipientEmail ||
    'prof.kovacs@redlab.bme.hu';

  const appBaseUrl =
    process.env.NEXT_PUBLIC_APP_URL || 'https://redlab-workspace.internal';
  const fullTargetUrl = payload.targetUrl
    ? payload.targetUrl.startsWith('http')
      ? payload.targetUrl
      : `${appBaseUrl}${payload.targetUrl}`
    : appBaseUrl;

  const htmlBody = `
<!DOCTYPE html>
<html lang="hu">
<head>
  <meta charset="utf-8">
  <title>${payload.title}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0d13; color: #f1f5f9; margin: 0; padding: 24px;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #12141d; border: 1px solid #1e2230; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #e11d48 0%, #9f1239 100%); padding: 24px 32px; text-align: left;">
      <div style="font-size: 11px; font-weight: bold; letter-spacing: 2px; color: #ffe4e6; text-transform: uppercase;">RED LAB • TUDOMÁNYOS KÖZPONT</div>
      <h1 style="color: #ffffff; margin: 8px 0 0 0; font-size: 20px; font-weight: bold;">${payload.title}</h1>
    </div>

    <!-- Body -->
    <div style="padding: 32px;">
      <p style="font-size: 14px; line-height: 1.6; color: #cbd5e1; margin-top: 0;">
        Tisztelt Témavezető / Kedves Csapattag!
      </p>

      <div style="background-color: #1a1e2e; border-left: 4px solid #e11d48; padding: 16px; border-radius: 8px; margin: 20px 0;">
        <p style="font-size: 14px; color: #f8fafc; margin: 0; line-height: 1.5;">
          ${payload.message}
        </p>
      </div>

      <!-- Details Table -->
      <table style="width: 100%; border-collapse: collapse; margin: 24px 0; font-size: 12px; color: #94a3b8;">
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #1e2230;">Felelős kutató:</td>
          <td style="padding: 8px 0; border-bottom: 1px solid #1e2230; text-align: right; color: #f1f5f9; font-weight: bold;">${payload.actorName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #1e2230;">Kutatási ág:</td>
          <td style="padding: 8px 0; border-bottom: 1px solid #1e2230; text-align: right; color: #f1f5f9;">${payload.workstream || 'RED Lab'}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0;">Eseménykategória:</td>
          <td style="padding: 8px 0; text-align: right; color: #e11d48; font-weight: bold;">${getEventCategoryLabel(payload.eventType)}</td>
        </tr>
      </table>

      <!-- CTA Button -->
      <div style="text-align: center; margin: 32px 0 16px 0;">
        <a href="${fullTargetUrl}" style="display: inline-block; background-color: #e11d48; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: bold; padding: 12px 28px; border-radius: 10px; box-shadow: 0 4px 12px rgba(225, 29, 72, 0.4);">
          Megnyitás a RED Lab Vezérlőpulton &rarr;
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="background-color: #0d0f17; padding: 16px 32px; border-top: 1px solid #1e2230; text-align: center; font-size: 11px; color: #64748b;">
      Ez egy automatikus értesítés a RED Lab Tudományos & Szakdolgozati Rendszerből.
    </div>
  </div>
</body>
</html>
  `;

  if (!apiKey) {
    // Graceful simulated delivery when RESEND_API_KEY is not yet populated
    return {
      sent: true,
      status: `Email sikeresen előkészítve (${recipient}) [Szimulált küldés - RESEND_API_KEY nincs beállítva]`,
    };
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'RED Lab <onboarding@resend.dev>',
        to: [recipient],
        subject: `[RED Lab] ${payload.title}`,
        html: htmlBody,
      }),
    });

    if (res.ok) {
      return { sent: true, status: `Email kiküldve: ${recipient}` };
    } else {
      const err = await res.text();
      return { sent: false, status: `Resend hiba: ${res.status} ${err}` };
    }
  } catch (err: any) {
    return { sent: false, status: `Email küldési hiba: ${err.message}` };
  }
}

/**
 * Main Dispatcher: Broadcasts to Discord and Email channels
 */
export async function dispatchRedLabEvent(
  payload: RedLabNotificationPayload
): Promise<NotificationDispatchResult> {
  const timestamp = new Date().toISOString();

  // 1. Dispatch Discord Webhook
  const discordResult = await sendDiscordWebhook(payload);

  // 2. Dispatch Supervisor Email if requested or event affects supervisor
  let emailResult = { sent: false, status: 'Nem volt email igényelve' };
  const shouldSendEmail =
    payload.sendEmail ||
    payload.eventType === 'TASK_READY_FOR_PROFESSOR' ||
    payload.eventType === 'MILESTONE_SIGNED_OFF' ||
    payload.eventType === 'MEETING_PROPOSED' ||
    payload.eventType === 'MEETING_RESCHEDULE_NEEDED';

  if (shouldSendEmail) {
    emailResult = await sendSupervisorEmail(payload);
  }

  return {
    success: discordResult.sent || emailResult.sent,
    discordSent: discordResult.sent,
    emailSent: emailResult.sent,
    discordStatus: discordResult.status,
    emailStatus: emailResult.status,
    timestamp,
  };
}
