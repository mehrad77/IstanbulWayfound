/** Build a click-to-chat link. Works without the WhatsApp API or a business account. */
export function whatsappUrl(number: string, text: string): string {
  const digits = number.replace(/[^\d]/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

export function telUrl(number: string): string {
  return `tel:${number.replace(/[^\d+]/g, "")}`;
}
