const TEAM_SHEET_ID = import.meta.env.VITE_TEAM_SHEET_ID;
const QUICKLINKS_SHEET_ID = import.meta.env.VITE_QUICKLINKS_SHEET_ID;
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

export async function fetchTeamMembers() {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${TEAM_SHEET_ID}/values/Uživatelé!A:F?key=${API_KEY}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (!data.values || data.values.length < 2) return [];

    const rows = data.values.slice(1);

    return rows
      .map(([name, email, phone, whatsapp, active, admin]) => ({
        name: name?.trim() || '',
        email: email?.trim().toLowerCase() || '',
        phone: phone?.trim() || '',
        wantsWhatsApp: whatsapp === '1',
        isActive: active === '1',
        isAdmin: admin === '1',
      }))
      .filter(m => m.name && m.email && m.isActive);
  } catch (error) {
    console.error('Error fetching team members:', error);
    return [];
  }
}

export async function fetchQuickLinks() {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${QUICKLINKS_SHEET_ID}/values/Odkazy!A:C?key=${API_KEY}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (!data.values || data.values.length < 2) return [];

    const rows = data.values.slice(1);

    const groups = [];
    let currentGroup = null;

    for (const [category, title, url] of rows) {
      if (!title || !url) continue;

      const cat = category?.trim() || null;

      if (currentGroup && currentGroup.category === cat) {
        currentGroup.links.push({ title: title.trim(), url: url.trim() });
      } else {
        currentGroup = { category: cat, links: [{ title: title.trim(), url: url.trim() }] };
        groups.push(currentGroup);
      }
    }

    return groups;
  } catch (error) {
    console.error('Error fetching quick links:', error);
    return [];
  }
}

export async function isEmailAllowed(email) {
  const members = await fetchTeamMembers();
  return members.some(m => m.email === email.toLowerCase());
}
