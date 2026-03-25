const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

admin.initializeApp();

const config = functions.config();
const APP_URL = config.app?.url || 'https://kampanmaster.web.app';

let transporter;
try {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: config.email?.user,
      pass: config.email?.password,
    },
  });
} catch (e) {}

const FROM_EMAIL = `"Kampanmaster" <${config.email?.user}>`;

// Notify on task assignment
exports.onTaskAssigned = functions.firestore
  .document('projects/{projectId}/tasks/{taskId}')
  .onWrite(async (change, context) => {
    const before = change.before.exists ? change.before.data() : null;
    const after = change.after.exists ? change.after.data() : null;
    if (!after) return;

    const beforeEmails = before?.peopleEmails || [];
    const afterEmails = after.peopleEmails || [];
    const newEmails = afterEmails.filter(e => !beforeEmails.includes(e));
    if (newEmails.length === 0) return;

    const projectDoc = await admin.firestore().doc(`projects/${context.params.projectId}`).get();
    const projectName = projectDoc.exists ? projectDoc.data().name : 'Neznámý projekt';

    for (const email of newEmails) {
      if (!transporter) continue;
      const mailOptions = {
        from: FROM_EMAIL,
        to: email,
        subject: `Nový úkol: ${after.text?.substring(0, 50)}${after.text?.length > 50 ? '...' : ''}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px;">
            <h2 style="color: #1a56db;">Byl vám přiřazen úkol</h2>
            <p><strong>Projekt:</strong> ${projectName}</p>
            <p><strong>Úkol:</strong> ${after.text}</p>
            ${after.deadline ? `<p><strong>Termín:</strong> ${new Date(after.deadline).toLocaleDateString('cs-CZ')}</p>` : ''}
            ${after.tag ? `<p><strong>Priorita:</strong> ${after.tag}</p>` : ''}
            <p style="margin-top: 20px;">
              <a href="${APP_URL}" style="background:#1a56db;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;">
                Otevřít úkolovník
              </a>
            </p>
          </div>
        `,
      };
      try {
        await transporter.sendMail(mailOptions);
      } catch (error) {
        console.error(`Error sending email to ${email}:`, error);
      }
    }
  });

// Daily reminders at 8:00 Prague time
exports.sendDailyReminders = functions.pubsub
  .schedule('0 8 * * *')
  .timeZone('Europe/Prague')
  .onRun(async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const threeDaysLater = new Date(today);
    threeDaysLater.setDate(today.getDate() + 3);

    const todayStr = today.toISOString().split('T')[0];
    const threeDaysStr = threeDaysLater.toISOString().split('T')[0];

    const projectsSnap = await admin.firestore().collection('projects').get();
    const upcomingTasks = [];

    for (const projectDoc of projectsSnap.docs) {
      const tasksSnap = await projectDoc.ref.collection('tasks')
        .where('done', '==', false)
        .where('deadline', '>=', todayStr)
        .where('deadline', '<=', threeDaysStr)
        .get();
      for (const taskDoc of tasksSnap.docs) {
        upcomingTasks.push({ ...taskDoc.data(), projectName: projectDoc.data().name });
      }
    }

    const byEmail = {};
    for (const task of upcomingTasks) {
      for (const email of (task.peopleEmails || [])) {
        if (!byEmail[email]) byEmail[email] = [];
        byEmail[email].push(task);
      }
    }

    for (const [email, tasks] of Object.entries(byEmail)) {
      if (!transporter) continue;
      const taskList = tasks.map(t =>
        `<li><strong>${t.text}</strong> (${t.projectName}) — termín: ${new Date(t.deadline).toLocaleDateString('cs-CZ')}</li>`
      ).join('');

      const mailOptions = {
        from: FROM_EMAIL,
        to: email,
        subject: `📅 Připomínka: ${tasks.length} úkol${tasks.length > 1 ? 'ů' : ''} s blížícím se termínem`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px;">
            <h2 style="color: #d97706;">Blíží se termíny vašich úkolů</h2>
            <ul>${taskList}</ul>
            <p style="margin-top: 20px;">
              <a href="${APP_URL}" style="background:#1a56db;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;">
                Otevřít úkolovník
              </a>
            </p>
          </div>
        `,
      };
      try {
        await transporter.sendMail(mailOptions);
      } catch (error) {
        console.error(`Error sending reminder to ${email}:`, error);
      }
    }
  });
