import curses
import time


class Colors:

    # Some colors
    BLACK = (0, 0, 0)
    BLUE = (129, 588, 953)
    CYAN = (0, 737, 831)
    GREEN = (298, 686, 314)
    GREY = (620, 620, 620)
    RED = (957, 263, 212)
    WHITE = (1000, 1000, 1000)
    YELLOW = (1000, 922, 231)


class ScreenUtility:
    def __init__(self):
        # Initiate the screen
        self.stdscr = curses.initscr()
        self.stdscr.keypad(True)
        curses.start_color()
        curses.noecho()
        curses.cbreak()

        # Get the screen width and height
        self.screen_height = curses.LINES
        self.screen_width = curses.COLS

        # Get the colors
        self.colors = Colors()
        self.color_table = {}
        self.create_color_table()

    def close(self):
        """Closes the application window"""
        curses.nocbreak()
        self.stdscr.keypad(False)
        curses.echo()
        curses.endwin()

    def create_color_table(self):
        colors = dir(self.colors)[:8]

        # Generate all colors
        for i in range(1, len(colors)+1):
            col = self.colors.__getattribute__(colors[i - 1])
            curses.init_color(i, *col)

        for fg in range(0, len(colors)):
            for bg in range(0, len(colors)):
                curses.init_pair(
                    len(self.color_table) + 1, fg+1, bg+1
                )
                self.color_table[colors[fg] + "_ON_" + colors[bg]] = len(self.color_table) + 1

    def print(self):
        for i in self.color_table:
            self.stdscr.addstr(i+"\n", curses.color_pair(self.color_table[i]))
            self.stdscr.scrollok(True)
            self.stdscr.refresh()
            time.sleep(.1)
        time.sleep(60)


if __name__ == "__main__":
    screen = ScreenUtility()
    screen.print()
    screen.close()
