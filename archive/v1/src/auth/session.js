import { getIronSession } from 'iron-session';

const sessionOptions = {
    password: process.env.SESSION_SECRET || 'a_random_32_character_string_for_cookie_signing',
    cookieName: 'acie_iron_session',
    cookieOptions: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'lax',
    },
};

export async function getSession(req, res) {
    const session = await getIronSession(req, res, sessionOptions);
    return session;
}

export async function saveSession(req, res, data) {
    const session = await getIronSession(req, res, sessionOptions);
    if (data.userId !== undefined) session.userId = data.userId;
    if (data.githubUsername !== undefined) session.githubUsername = data.githubUsername;
    if (data.oauthState !== undefined) session.oauthState = data.oauthState;
    await session.save();
}
