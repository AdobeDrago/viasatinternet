"""Local-preview shim: build.py leaves :icon: tokens in fragment .plain.html files."""
import pathlib, re
ICON = re.compile(r'(?<=[\s>]):([a-z][a-z-]*[a-z]):(?=[\s<])')
for name in ('nav.plain.html', 'footer.plain.html'):
    p = pathlib.Path('..') / name
    p.write_text(ICON.sub(r'<span class="icon icon-\1"></span>', p.read_text()))
