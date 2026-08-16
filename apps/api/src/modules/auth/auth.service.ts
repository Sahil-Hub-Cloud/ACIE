import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private dbService: DatabaseService
  ) {}

  async authenticateGithub(code: string): Promise<{ token: string; user: any }> {
    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error('GitHub client environment variables are not configured');
    }

    try {
      // 1. Exchange code for GitHub access token
      const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          code,
        }),
      });

      const tokenData = await tokenResponse.json() as { access_token?: string; error?: string };
      const accessToken = tokenData.access_token;

      if (!accessToken || tokenData.error) {
        throw new UnauthorizedException(`GitHub Auth Failed: ${tokenData.error || 'No access token'}`);
      }

      // 2. Fetch user profile from GitHub
      const userResponse = await fetch('https://api.github.com/user', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const githubUser = await userResponse.json() as { id: number; login: string; name?: string; avatar_url?: string; email?: string };

      // 3. Fetch primary email if not visible in public profile
      let email = githubUser.email;
      if (!email) {
        const emailsResponse = await fetch('https://api.github.com/user/emails', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const emails = await emailsResponse.json() as Array<{ email: string; primary: boolean }>;
        email = emails.find(e => e.primary)?.email || emails[0]?.email || null;
      }

      // 4. Register or update user in SQLite
      const existingUser = this.dbService.get(
        'SELECT * FROM users WHERE github_id = ?',
        githubUser.id
      );

      let userId = existingUser?.id;

      if (!existingUser) {
        const result = this.dbService.run(
          `INSERT INTO users (github_id, username, email, avatar_url, role)
           VALUES (?, ?, ?, ?, ?)`,
          githubUser.id,
          githubUser.login,
          email,
          githubUser.avatar_url || null,
          githubUser.id === 1 ? 'admin' : 'developer' // simple role assignment
        );
        userId = result.lastInsertRowid as number;
      } else {
        this.dbService.run(
          `UPDATE users SET username = ?, email = ?, avatar_url = ? WHERE id = ?`,
          githubUser.login,
          email,
          githubUser.avatar_url || null,
          existingUser.id
        );
      }

      const dbUser = this.dbService.get('SELECT * FROM users WHERE id = ?', userId);

      // 5. Generate JWT token
      const jwtPayload = {
        sub: dbUser.id,
        username: dbUser.username,
        avatarUrl: dbUser.avatar_url,
        role: dbUser.role,
      };

      const token = await this.jwtService.signAsync(jwtPayload);

      return {
        token,
        user: {
          id: dbUser.id,
          username: dbUser.username,
          email: dbUser.email,
          avatarUrl: dbUser.avatar_url,
          role: dbUser.role,
        },
      };
    } catch (err) {
      throw new UnauthorizedException(`OAuth failed: ${(err as Error).message}`);
    }
  }

  async getMe(userId: number) {
    const user = this.dbService.get(
      'SELECT id, github_id, username, email, avatar_url, role, created_at FROM users WHERE id = ?',
      userId
    );
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user;
  }
}
