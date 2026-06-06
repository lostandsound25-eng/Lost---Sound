import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { email, tripId, tripName, inviterEmail, origin } = await request.json();

    if (!email || !tripId) {
      return NextResponse.json({ error: 'Email and Trip ID are required' }, { status: 400 });
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error('RESEND_API_KEY is not defined in environment variables.');
      return NextResponse.json({ 
        error: 'Invite email could not be sent because RESEND_API_KEY is not configured. Please configure it in your environment.' 
      }, { status: 500 });
    }

    const fromEmail = process.env.RESEND_FROM_EMAIL || 'go@lostandsoundtravel.com';
    const cleanInviter = inviterEmail || 'A collaborator';
    const cleanTripName = tripName || 'their trip';
    const cleanOrigin = origin || 'https://lostandsoundtravel.com'; // Fallback
    const dashboardLink = `${cleanOrigin}/tracker?tripId=${tripId}&email=${encodeURIComponent(email)}`;

    const subject = `${cleanInviter} invited you to join their trip "${cleanTripName}" on Lost & Sound`;

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Join my trip on Lost & Sound</title>
</head>
<body style="background-color: #F9F6ED; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 40px 20px; margin: 0;">
  <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; padding: 40px 32px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05); border: 1px solid #E5E7EB;">
    <!-- Logo or Heading -->
    <div style="text-align: center; margin-bottom: 32px;">
      <h2 style="color: #6D28D9; font-weight: 900; margin: 0; font-size: 24px; letter-spacing: -0.025em; font-family: -apple-system, BlinkMacSystemFont, sans-serif;">LOST & SOUND</h2>
      <p style="color: #6B7280; font-size: 14px; margin: 4px 0 0 0;">Custom Travel Planning & Tracker</p>
    </div>

    <!-- Core Message -->
    <p style="font-size: 16px; color: #1F2937; line-height: 1.6; margin-top: 0;">
      Hi there,
    </p>
    <p style="font-size: 16px; color: #1F2937; line-height: 1.6;">
      <strong>${cleanInviter}</strong> has invited you to collaborate on their upcoming trip, <strong>"${cleanTripName}"</strong>, on the Lost & Sound Travel Tracker!
    </p>
    
    <p style="font-size: 16px; color: #1F2937; line-height: 1.6; margin-bottom: 32px;">
      Now you can view the trip budget, log daily expenses, and track your travel spending together in real time.
    </p>

    <!-- Call to Action -->
    <div style="text-align: center; margin-bottom: 32px;">
      <a href="${dashboardLink}" style="background-color: #6D28D9; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 12px; font-weight: 700; font-size: 15px; display: inline-block; box-shadow: 0 4px 12px rgba(109, 40, 217, 0.2);">
        Accept Invitation
      </a>
    </div>

    <hr style="border: 0; border-top: 1px solid #E5E7EB; margin: 32px 0;">

    <!-- Helpful Tips -->
    <h4 style="font-size: 14px; color: #4B5563; margin-top: 0; margin-bottom: 8px;">💡 A Quick Tip for Mobile Users:</h4>
    <p style="font-size: 13px; color: #6B7280; line-height: 1.5; margin: 0;">
      If you open this email on your phone, click the button above to go to the dashboard. If prompted to sign in, use the same email address that received this invite to access the shared trip.
    </p>

    <div style="margin-top: 32px; text-align: center;">
      <p style="font-size: 12px; color: #9CA3AF; margin: 0;">
        Lost & Sound Travel © 2026. Happy travels!
      </p>
    </div>
  </div>
</body>
</html>
`;

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: fromEmail,
        to: email,
        subject: subject,
        html: htmlContent,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Resend API Error:', data);
      return NextResponse.json({ error: data.message || 'Failed to send email via Resend' }, { status: response.status });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Invite API Route Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
