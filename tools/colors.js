export class Color {
    static normal = '\u001b[0m';
    static bold = '\u001b[1m'; // TODO: Bold sometime not appearing on dark mode
    static italic = '\u001b[3m';
    static underline = '\u001b[4m';
    static strike = '\u001b[9m';
    static black = '\u001b[30m';
    static red = '\u001b[31m';
    static green = '\u001b[32m';
    static yellow = '\u001b[33m';
    static blue = '\u001b[34m';
    static magenta = '\u001b[35m';
    static cyan = '\u001b[36m';
    static white = '\u001b[37m';
    static reset = '\u001b[0m'; // Reset Foreground and Background
}