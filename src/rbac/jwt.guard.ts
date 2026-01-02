import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthGuard } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

// --- JWT Strategy ---
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
constructor() {
super({
jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
secretOrKey: process.env.JWT_SECRET, // replace with env variable in production
});
}

async validate(payload: any) {
// This payload becomes request.user
return { userId: payload.sub, username: payload.username, role: payload.role };
}
}

// --- JWT AuthGuard ---
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}

// --- Module Setup ---
import { Module } from '@nestjs/common';

@Module({
imports: [
JwtModule.register({
secret: process.env.JWT_SECRET, // replace with env variable
signOptions: { expiresIn: '15m' },
}),
],
providers: [JwtStrategy],
exports: [JwtAuthGuard],
})
export class AuthModule {}
