import { extractEmailsFromNotification } from '../../src/utils/notificationParser';

describe('Notification Parcer - extractEmailsFromNotification', () => {
  it('should extract a single email from a notification', () => {
    const notification = 'Hello @student1@example.com, please check!';
    const result = extractEmailsFromNotification(notification);
    expect(result).toEqual(['student1@example.com']);
  });

  it('should extract multiple emails from a notification', () => {
    const notification =
      'Hello @student1@example.com, @student2@example.com please check!';
    const result = extractEmailsFromNotification(notification);
    expect(result).toEqual(['student1@example.com', 'student2@example.com']);
  });

  it('should return an empty array when no emails are mentioned', () => {
    const notification = 'Hello students, please check!';
    const result = extractEmailsFromNotification(notification);
    expect(result).toEqual([]);
  });

  it('should ignore incorrectly formatted mentions', () => {
    const notification = 'Hello @student1example.com, please check!';
    const result = extractEmailsFromNotification(notification);
    expect(result).toEqual([]); // Not a valid email format
  });

  it('should handle emails with subdomains', () => {
    const notification = 'Hello @student@sub.example.com, updates available!';
    const result = extractEmailsFromNotification(notification);
    expect(result).toEqual(['student@sub.example.com']);
  });

  it('should handle special characters in email usernames', () => {
    const notification = 'Hello @test.user+alias@example.com, check updates!';
    const result = extractEmailsFromNotification(notification);
    expect(result).toEqual(['test.user+alias@example.com']);
  });

  it("should not extract emails that are not preceded by '@'", () => {
    const notification = 'Email: student1@example.com is not mentioned';
    const result = extractEmailsFromNotification(notification);
    expect(result).toEqual([]); // No '@' prefix, so should be ignored
  });

  it('should extract emails correctly from a complex notification', () => {
    const notification =
      'Hello @student1@example.com! Check with @teacher@school.edu and @admin@company.org';
    const result = extractEmailsFromNotification(notification);
    expect(result).toEqual([
      'student1@example.com',
      'teacher@school.edu',
      'admin@company.org',
    ]);
  });
});