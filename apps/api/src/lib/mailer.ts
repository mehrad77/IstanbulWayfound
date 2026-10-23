export interface Mailer {
  sendMagicLink(to: string, link: string): Promise<void>;
}

/** Demo mailer: logs the link. A real provider (e.g. Resend) implements the same interface. */
export class ConsoleMailer implements Mailer {
  async sendMagicLink(to: string, link: string) {
    console.log(`[magic-link] ${to}: ${link}`);
  }
}
