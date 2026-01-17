import { Resend } from 'resend'

// Initialize Resend client
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null

const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@kmedtour.com'
const FROM_NAME = process.env.FROM_NAME || 'KmedTour'

export interface EmailPayload {
  to: string
  subject: string
  html: string
  text?: string
  replyTo?: string
}

export interface WhatsAppPayload {
  to: string
  templateName: string
  language: string
  components: Array<{
    type: string
    parameters: Array<{ type: string; text?: string }>
  }>
}

// Email Templates
export const emailTemplates = {
  welcome: (data: { patientName: string }) => ({
    subject: 'Welcome to KmedTour - Your Medical Journey Begins',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #0F766E;">Welcome to KmedTour!</h1>
        <p>Dear ${data.patientName},</p>
        <p>Thank you for choosing KmedTour for your medical tourism journey. We're committed to providing you with world-class healthcare at affordable prices.</p>
        <p>A dedicated patient coordinator will be assigned to you shortly and will reach out to discuss your treatment options.</p>
        <p>In the meantime, feel free to explore our website to learn more about our services and partner hospitals.</p>
        <br/>
        <p>Best regards,</p>
        <p><strong>The KmedTour Team</strong></p>
      </div>
    `,
    text: `Welcome to KmedTour!\n\nDear ${data.patientName},\n\nThank you for choosing KmedTour for your medical tourism journey.\n\nBest regards,\nThe KmedTour Team`,
  }),

  quote_ready: (data: { patientName: string; totalAmount: number; currency: string; validUntil: string }) => ({
    subject: 'Your Treatment Quote is Ready - KmedTour',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #0F766E;">Your Quote is Ready!</h1>
        <p>Dear ${data.patientName},</p>
        <p>Great news! We've prepared a personalized treatment quote for you.</p>
        <div style="background: #F0FDFA; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; font-size: 24px; font-weight: bold; color: #0F766E;">
            ${data.currency} ${data.totalAmount.toLocaleString()}
          </p>
          <p style="margin: 5px 0 0 0; color: #666;">Total estimated cost</p>
        </div>
        <p>This quote is valid until <strong>${new Date(data.validUntil).toLocaleDateString()}</strong>.</p>
        <p>Please log in to your patient portal to review the full breakdown and accept the quote.</p>
        <br/>
        <p>Best regards,</p>
        <p><strong>The KmedTour Team</strong></p>
      </div>
    `,
    text: `Your Quote is Ready!\n\nDear ${data.patientName},\n\nTotal: ${data.currency} ${data.totalAmount.toLocaleString()}\nValid until: ${new Date(data.validUntil).toLocaleDateString()}\n\nBest regards,\nThe KmedTour Team`,
  }),

  booking_confirmed: (data: { patientName: string; bookingId: string; treatmentDate?: string }) => ({
    subject: 'Booking Confirmed - KmedTour',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #0F766E;">Booking Confirmed!</h1>
        <p>Dear ${data.patientName},</p>
        <p>Your booking has been confirmed. Here are your booking details:</p>
        <div style="background: #F0FDFA; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Booking Reference:</strong> ${data.bookingId.slice(0, 8).toUpperCase()}</p>
          ${data.treatmentDate ? `<p style="margin: 10px 0 0 0;"><strong>Treatment Date:</strong> ${new Date(data.treatmentDate).toLocaleDateString()}</p>` : ''}
        </div>
        <p>Your patient coordinator will be in touch soon with next steps, including travel arrangements and pre-treatment preparations.</p>
        <br/>
        <p>Best regards,</p>
        <p><strong>The KmedTour Team</strong></p>
      </div>
    `,
    text: `Booking Confirmed!\n\nDear ${data.patientName},\n\nBooking Reference: ${data.bookingId.slice(0, 8).toUpperCase()}\n\nBest regards,\nThe KmedTour Team`,
  }),

  payment_received: (data: { patientName: string; amount: number; currency: string; paymentType: string }) => ({
    subject: 'Payment Received - KmedTour',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #0F766E;">Payment Received</h1>
        <p>Dear ${data.patientName},</p>
        <p>We've received your ${data.paymentType === 'deposit' ? 'deposit' : 'payment'}.</p>
        <div style="background: #F0FDFA; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; font-size: 24px; font-weight: bold; color: #0F766E;">
            ${data.currency} ${data.amount.toLocaleString()}
          </p>
          <p style="margin: 5px 0 0 0; color: #666;">${data.paymentType === 'deposit' ? 'Deposit payment' : 'Full payment'}</p>
        </div>
        <p>Thank you for your payment. Your patient coordinator will contact you shortly with the next steps.</p>
        <br/>
        <p>Best regards,</p>
        <p><strong>The KmedTour Team</strong></p>
      </div>
    `,
    text: `Payment Received\n\nDear ${data.patientName},\n\nAmount: ${data.currency} ${data.amount.toLocaleString()}\nType: ${data.paymentType}\n\nBest regards,\nThe KmedTour Team`,
  }),

  travel_reminder: (data: { patientName: string; arrivalDate: string; hospitalName: string }) => ({
    subject: 'Travel Reminder - Your Treatment Awaits',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #0F766E;">Your Journey Begins Soon!</h1>
        <p>Dear ${data.patientName},</p>
        <p>This is a friendly reminder that your medical journey is approaching.</p>
        <div style="background: #F0FDFA; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Arrival Date:</strong> ${new Date(data.arrivalDate).toLocaleDateString()}</p>
          <p style="margin: 10px 0 0 0;"><strong>Hospital:</strong> ${data.hospitalName}</p>
        </div>
        <h3>Pre-Travel Checklist:</h3>
        <ul>
          <li>Passport and visa (if required)</li>
          <li>Medical records and test results</li>
          <li>Travel insurance documents</li>
          <li>Emergency contact information</li>
          <li>Comfortable clothing for recovery</li>
        </ul>
        <p>If you have any questions, please don't hesitate to contact your patient coordinator.</p>
        <br/>
        <p>Safe travels!</p>
        <p><strong>The KmedTour Team</strong></p>
      </div>
    `,
    text: `Your Journey Begins Soon!\n\nDear ${data.patientName},\n\nArrival Date: ${new Date(data.arrivalDate).toLocaleDateString()}\nHospital: ${data.hospitalName}\n\nSafe travels!\nThe KmedTour Team`,
  }),
}

export async function sendEmail(payload: EmailPayload): Promise<{ success: boolean; messageId?: string; error?: string }> {
  if (!resend) {
    console.warn('[notifications] Resend not configured, skipping email')
    return { success: false, error: 'Email service not configured' }
  }

  try {
    const { data, error } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
      reply_to: payload.replyTo,
    })

    if (error) {
      console.error('[notifications] Resend error:', error)
      return { success: false, error: error.message }
    }

    return { success: true, messageId: data?.id }
  } catch (error) {
    console.error('[notifications] Send email error:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// WhatsApp Business API integration (placeholder - needs WhatsApp Business API setup)
export async function sendWhatsApp(payload: WhatsAppPayload): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const whatsappToken = process.env.WHATSAPP_ACCESS_TOKEN
  const whatsappPhoneId = process.env.WHATSAPP_PHONE_NUMBER_ID

  if (!whatsappToken || !whatsappPhoneId) {
    console.warn('[notifications] WhatsApp not configured, skipping')
    return { success: false, error: 'WhatsApp service not configured' }
  }

  try {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${whatsappPhoneId}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${whatsappToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: payload.to,
          type: 'template',
          template: {
            name: payload.templateName,
            language: { code: payload.language },
            components: payload.components,
          },
        }),
      }
    )

    const data = await response.json()

    if (!response.ok) {
      console.error('[notifications] WhatsApp API error:', data)
      return { success: false, error: data.error?.message || 'WhatsApp API error' }
    }

    return { success: true, messageId: data.messages?.[0]?.id }
  } catch (error) {
    console.error('[notifications] Send WhatsApp error:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Notification processor - processes queued notifications from the database
export async function processNotificationQueue(
  client: ReturnType<typeof import('@supabase/supabase-js').createClient>
): Promise<{ processed: number; failed: number }> {
  let processed = 0
  let failed = 0

  // Get pending notifications
  const { data: notifications, error } = await client
    .from('notifications')
    .select(`
      *,
      journey:journey_id(
        patient_intake_id,
        patient_intake:patient_intake_id(full_name, email, phone)
      )
    `)
    .eq('status', 'pending')
    .order('priority', { ascending: false })
    .order('created_at', { ascending: true })
    .limit(50)

  if (error || !notifications) {
    console.error('[notifications] Failed to fetch queue:', error)
    return { processed, failed }
  }

  for (const notification of notifications) {
    const patientIntake = (notification.journey as { patient_intake?: { full_name?: string; email?: string; phone?: string } })?.patient_intake

    if (!patientIntake) {
      await client
        .from('notifications')
        .update({ status: 'failed', error_message: 'Patient intake not found' })
        .eq('id', notification.id)
      failed++
      continue
    }

    const patientName = patientIntake.full_name || 'Patient'
    const templateData = { patientName, ...notification.data }

    let result: { success: boolean; messageId?: string; error?: string }

    if (notification.channel === 'email' && patientIntake.email) {
      const template = emailTemplates[notification.template_name as keyof typeof emailTemplates]
      if (template) {
        const emailContent = template(templateData as never)
        result = await sendEmail({
          to: patientIntake.email,
          ...emailContent,
        })
      } else {
        result = { success: false, error: 'Template not found' }
      }
    } else if (notification.channel === 'whatsapp' && patientIntake.phone) {
      result = await sendWhatsApp({
        to: patientIntake.phone,
        templateName: notification.template_name,
        language: 'en',
        components: [],
      })
    } else {
      result = { success: false, error: 'Invalid channel or missing contact info' }
    }

    // Update notification status
    await client
      .from('notifications')
      .update({
        status: result.success ? 'sent' : 'failed',
        sent_at: result.success ? new Date().toISOString() : null,
        external_id: result.messageId,
        error_message: result.error,
      })
      .eq('id', notification.id)

    if (result.success) {
      processed++
    } else {
      failed++
    }
  }

  return { processed, failed }
}
