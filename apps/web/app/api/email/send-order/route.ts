import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface OrderItem {
  commonName: string;
  botanicalName: string;
  quantity: number;
  containerSize: string;
  price: number;
}

interface OrderPayload {
  to: string;
  items: OrderItem[];
  total: number;
  nurseryName: string;
  date: string;
  ref: string;
}

function buildOrderHtml(payload: OrderPayload): string {
  const rows = payload.items
    .map(
      (item) => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;font-weight:500">${item.commonName}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;font-style:italic;color:#666">${item.botanicalName}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:center">${item.quantity}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #eee">${item.containerSize}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right">$${(item.price / 100).toFixed(2)}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right;font-weight:500">$${((item.price * item.quantity) / 100).toFixed(2)}</td>
      </tr>`
    )
    .join('');

  const totalQty = payload.items.reduce((s, i) => s + i.quantity, 0);

  return `
    <div style="max-width:640px;margin:0 auto;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#111">
      <div style="border-bottom:1px solid #ddd;padding-bottom:20px;margin-bottom:20px">
        <h1 style="margin:0;font-size:22px">Order Request</h1>
        <p style="margin:4px 0 0;color:#666;font-size:16px">${payload.nurseryName}</p>
        <p style="margin:12px 0 0;color:#999;font-size:13px">Date: ${payload.date}<br/>Ref: ${payload.ref}</p>
      </div>
      <table style="width:100%;border-collapse:collapse;font-size:13px">
        <thead>
          <tr style="border-bottom:2px solid #ddd">
            <th style="padding:8px 12px;text-align:left;font-size:11px;text-transform:uppercase;color:#888">Plant</th>
            <th style="padding:8px 12px;text-align:left;font-size:11px;text-transform:uppercase;color:#888">Botanical Name</th>
            <th style="padding:8px 12px;text-align:center;font-size:11px;text-transform:uppercase;color:#888">Qty</th>
            <th style="padding:8px 12px;text-align:left;font-size:11px;text-transform:uppercase;color:#888">Size</th>
            <th style="padding:8px 12px;text-align:right;font-size:11px;text-transform:uppercase;color:#888">Unit Price</th>
            <th style="padding:8px 12px;text-align:right;font-size:11px;text-transform:uppercase;color:#888">Total</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <div style="border-top:1px solid #ddd;margin-top:16px;padding-top:16px;text-align:right">
        <p style="margin:0;color:#666;font-size:13px">Subtotal (${totalQty} plants): <strong>$${(payload.total / 100).toFixed(2)}</strong></p>
        <p style="margin:4px 0 0;color:#666;font-size:13px">Tax: TBD</p>
        <p style="margin:8px 0 0;font-size:18px;font-weight:700">Estimated Total: $${(payload.total / 100).toFixed(2)}</p>
      </div>
      <p style="margin-top:32px;font-size:11px;color:#aaa">Sent from Living Wildly Free</p>
    </div>
  `;
}

export async function POST(req: NextRequest) {
  try {
    const payload: OrderPayload = await req.json();

    if (!payload.to || !payload.items?.length) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const html = buildOrderHtml(payload);

    const { data, error } = await resend.emails.send({
      from: 'Living Wildly Free <orders@updates.livingwildlyfree.com>',
      to: payload.to,
      subject: `Order Request — ${payload.nurseryName} (${payload.ref})`,
      html,
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ id: data?.id });
  } catch (err) {
    console.error('Email send error:', err);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
