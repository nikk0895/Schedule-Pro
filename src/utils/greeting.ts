export function getGreetingMessage(): string {
  const hour = new Date().getHours();
  if (hour < 5) return 'You’re up early!';
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  if (hour < 21) return 'Good Evening';
  return 'Good Night';
}
