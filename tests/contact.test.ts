import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { contactMessageSchema, sanitizeInput } from '../src/lib/security/validation';

describe('Contact Form Validation & Security', () => {
  describe('Input Sanitization', () => {
    it('strips HTML tags from input string', () => {
      const dirty = '<script>alert("hack")</script>Hello <b>World</b>';
      const clean = sanitizeInput(dirty);
      assert.equal(clean, 'alert("hack")Hello World');
    });

    it('strips control characters', () => {
      const dirty = 'Hello\u0000\u001F World';
      const clean = sanitizeInput(dirty);
      assert.equal(clean, 'Hello World');
    });
  });

  describe('contactMessageSchema', () => {
    it('validates and sanitizes a valid contact message', () => {
      const input = {
        name: '  Kiran Sinha  ',
        email: 'KIRAN@example.com  ',
        message: 'Hello, I want to discuss a project! <p>Details here</p>',
      };

      const result = contactMessageSchema.safeParse(input);
      assert.equal(result.success, true);
      if (result.success) {
        assert.equal(result.data.name, 'Kiran Sinha');
        assert.equal(result.data.email, 'kiran@example.com');
        assert.equal(result.data.message, 'Hello, I want to discuss a project! Details here');
      }
    });

    it('rejects invalid email address', () => {
      const input = {
        name: 'Valid Name',
        email: 'not-an-email',
        message: 'Valid message body.',
      };

      const result = contactMessageSchema.safeParse(input);
      assert.equal(result.success, false);
      if (!result.success) {
        assert.equal(result.error.issues[0].path[0], 'email');
      }
    });

    it('rejects empty name or message', () => {
      const emptyName = contactMessageSchema.safeParse({
        name: '   ',
        email: 'valid@example.com',
        message: 'Valid message.',
      });
      assert.equal(emptyName.success, false);

      const emptyMsg = contactMessageSchema.safeParse({
        name: 'Valid Name',
        email: 'valid@example.com',
        message: '   ',
      });
      assert.equal(emptyMsg.success, false);
    });
  });

  describe('Rate Limiting Logic', () => {
    it('enforces request caps per window', () => {
      const map = new Map<string, { count: number; resetTime: number }>();
      const windowMs = 1000;
      const limit = 3;

      function rateLimit(ip: string): boolean {
        const now = Date.now();
        const record = map.get(ip);
        if (!record || now > record.resetTime) {
          map.set(ip, { count: 1, resetTime: now + windowMs });
          return true;
        }
        if (record.count >= limit) return false;
        record.count += 1;
        return true;
      }

      assert.equal(rateLimit('1.2.3.4'), true); // 1
      assert.equal(rateLimit('1.2.3.4'), true); // 2
      assert.equal(rateLimit('1.2.3.4'), true); // 3
      assert.equal(rateLimit('1.2.3.4'), false); // blocked
      assert.equal(rateLimit('5.6.7.8'), true); // different IP allowed
    });
  });
});
