export function quickCall(phone: string) {
  window.open(`tel:${phone}`, '_blank');
}

export function quickMessage(phone: string) {
  window.open(`https://t.me/${phone.replace(/[^0-9]/g, '')}`, '_blank');
}
