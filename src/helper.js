export function getUsernameFromEmail(email) {
    const match = email.match(/^([^@]+)@/);
    return match ? match[1] : null;
  }
